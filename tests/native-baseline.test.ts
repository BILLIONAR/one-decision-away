import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

// The native app must not install below the CSS framework's Safari 16.4 floor.
const APP_IOS_MINIMUM = '16.4';
const root = fileURLToPath(new URL('../', import.meta.url));
const projectDirectory = join(root, 'ios/App/App.xcodeproj');
const project = readFileSync(join(projectDirectory, 'project.pbxproj'), 'utf8');
const packagePath = join(root, 'ios/App/CapApp-SPM/Package.swift');
const swiftPackage = readFileSync(packagePath, 'utf8');
const require = createRequire(import.meta.url);

function swiftMinimum(source: string): string {
  const match = source.match(/platforms\s*:\s*\[\s*\.iOS\(\s*(?:\.v([\d_]+)|"([\d.]+)")\s*\)/);
  assert.ok(match, 'an explicit Swift iOS library minimum is required');
  return (match[1] ?? match[2]).replaceAll('_', '.');
}
function notAbove(version: string, maximum: string): boolean {
  const parts = version.split('.').map(Number);
  const limit = maximum.split('.').map(Number);
  for (let index = 0; index < Math.max(parts.length, limit.length); index += 1) {
    if ((parts[index] ?? 0) !== (limit[index] ?? 0)) return (parts[index] ?? 0) < (limit[index] ?? 0);
  }
  return true;
}

test('every iOS project and application build configuration enforces the Safari 16.4 baseline', () => {
  const section = project.match(/Begin XCBuildConfiguration section([\s\S]*?)End XCBuildConfiguration section/);
  assert.ok(section);
  const configurations = new Map([...section[1].matchAll(/([A-F\d]{24}) \/\* ([^*]+) \*\/ = \{([\s\S]*?)\n\t\t\};/g)]
    .map(match => [match[1], { name: match[2], target: match[3].match(/IPHONEOS_DEPLOYMENT_TARGET\s*=\s*([^;]+);/)?.[1].trim() }]));
  assert.ok(configurations.size >= 4, 'must inspect project and app Debug/Release configurations');
  for (const configuration of configurations.values()) {
    assert.equal(configuration.target, APP_IOS_MINIMUM, `${configuration.name} must not inherit an older app minimum`);
  }
  for (const owner of ['PBXProject', 'PBXNativeTarget']) {
    const list = project.match(new RegExp(`Build configuration list for ${owner} "App" \\*/ = \\{[\\s\\S]*?buildConfigurations = \\(([\\s\\S]*?)\\);`));
    assert.ok(list, `${owner} App configuration list exists`);
    const names = [...list[1].matchAll(/([A-F\d]{24}) \/\* ([^*]+) \*\//g)].map(match => {
      const configuration = configurations.get(match[1]);
      assert.ok(configuration, `${owner} configuration ${match[1]} was checked`);
      return configuration.name;
    });
    assert.ok(names.includes('Debug') && names.includes('Release'), `${owner} has checked Debug and Release targets`);
  }
});

test('Capacitor sync keeps a compatible generated Swift package floor without lowering the app minimum', () => {
  const { getMajoriOSVersion } = require('@capacitor/cli/dist/ios/common.js');
  const generatedMajor = getMajoriOSVersion({ ios: { nativeXcodeProjDirAbs: projectDirectory } });
  assert.equal(generatedMajor, APP_IOS_MINIMUM.split('.')[0]);
  assert.equal(swiftMinimum(swiftPackage), generatedMajor, 'the checked-in generated wrapper must match Capacitor sync');
  assert.ok(notAbove(swiftMinimum(swiftPackage), APP_IOS_MINIMUM));
});

test('installed native dependency library floors are compatible with the Swift wrapper and app', () => {
  const dependencies = [...swiftPackage.matchAll(/\.package\(name:\s*"([^"]+)",\s*path:\s*"([^"]+)"\)/g)];
  assert.ok(dependencies.length > 0);
  for (const [, name, path] of dependencies) {
    const minimum = swiftMinimum(readFileSync(join(resolve(dirname(packagePath), path), 'Package.swift'), 'utf8'));
    assert.ok(notAbove(minimum, swiftMinimum(swiftPackage)), `${name} requires ${minimum}, above the generated wrapper floor`);
    assert.ok(notAbove(minimum, APP_IOS_MINIMUM), `${name} requires ${minimum}, above the application minimum`);
  }
});

test('native metadata cannot override the application minimum with an older target', () => {
  const metadata = readFileSync(join(root, 'ios/App/App/Info.plist'), 'utf8');
  const explicitMinimum = metadata.match(/<key>MinimumOSVersion<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
  assert.ok(explicitMinimum === undefined || explicitMinimum === APP_IOS_MINIMUM || explicitMinimum === '$(IPHONEOS_DEPLOYMENT_TARGET)');
  const walk = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : entry.isFile() && path.endsWith('.xcconfig') ? [path] : [];
  });
  for (const file of walk(join(root, 'ios'))) {
    for (const match of readFileSync(file, 'utf8').matchAll(/^\s*IPHONEOS_DEPLOYMENT_TARGET(?:\[[^\]]+\])*\s*=\s*([^\s/;]+)/gm)) {
      assert.equal(match[1], APP_IOS_MINIMUM, `${file} must not override the application baseline`);
    }
  }
  assert.equal(existsSync(join(root, 'ios/App/Podfile')), false, 'SPM project has no competing CocoaPods platform override');
});
