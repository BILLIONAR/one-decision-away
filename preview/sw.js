/* One Decision Away: each deployment owns its own offline shell and caches. */
const BASE = new URL(self.registration.scope);
const CACHE_PREFIX = `oda:${encodeURIComponent(BASE.pathname)}:`;
const BUILD = {"version":"build-d3a79cb7822ecc6f","assets":["assets/Account-BIBk0Pr2.css","assets/Account-DVxkmgJJ.js","assets/AppShell-C9mN4jr5.css","assets/AppShell-CUEQrXmb.js","assets/AuthProviderButtons-BnBaQGc7.js","assets/BackupReminder-DPX-SXOg.js","assets/BackupRestoreReview-BRLUHxz8.js","assets/BeliefLab-CdGaNHyI.js","assets/BookIdeas-CsIjUNXe.js","assets/Bridge-BClv1eNY.js","assets/Budget-DfBGjXVD.js","assets/ChipScroller-CdRw5Rkt.css","assets/ChipScroller-CsqriB3N.js","assets/Coach-DLFE1rcc.js","assets/CoachBrainDump-B1dmWG7p.css","assets/CoachBrainDump-BlKc7H0e.js","assets/CoachCloudConsent-31rHjUUl.js","assets/CoachProfile-5HXDb4jO.css","assets/CoachProfile-BFtPa_A5.js","assets/CoachResearchSources-C0MCIk_Y.js","assets/CourseCover-DTFBLIX7.js","assets/CourseRoadmap-B63csT-q.css","assets/CourseRoadmap-D5y8M4wG.js","assets/Courses-C5vLMRk2.css","assets/Courses-DSWPoBhD.js","assets/DailyAffirmationWidget-C-F-H1uF.js","assets/DailyDeepQuestion-esuSLcsa.js","assets/DailyMicroHabits-CnQ9L67N.js","assets/DailyPractice-CCd2j41g.js","assets/DecisionPlanModal-C5zv5uBe.js","assets/DreamArt-BiCnWT0d.js","assets/Dreams-D3o6Fnk-.js","assets/EveningCheckIn-622-V8Qh.js","assets/Evidence-COm4VI0A.js","assets/EvidenceTree-BCKdmVJM.js","assets/EvidenceTree-CyJd2L-S.css","assets/FirstWeekPlanView-CoEptO9H.js","assets/Focus-l7-wGlXR.js","assets/FocusLockView-B5g_re8w.js","assets/FocusTimerHub-DdR9r-13.js","assets/FutureNote-CBceFM_j.css","assets/FutureNote-M3iFHkLM.js","assets/FutureSelf-BhnZd_ky.js","assets/GrowthDashboard-C9alAgj8.js","assets/HealthConnections-BgWahjyb.js","assets/Insights-Dm0sPCOv.js","assets/Insights-zIi_fF9v.css","assets/Landing-C9ACQ0FJ.css","assets/Landing-DnJ-T6dh.js","assets/LanguagePicker-Wi4D_x97.js","assets/LearningRoute-BdFxSpsH.js","assets/Legal-23i8pwl1.js","assets/Me-Botp7qhC.js","assets/MeditateNowWidget-DOeozVJk.js","assets/MemberExperience-B8AcdKlQ.css","assets/MemberExperience-DAoLn8AF.js","assets/MemberHabitEvidence-Dv7qcCes.js","assets/MemberPlanTune-Bgcy2YF-.js","assets/MemberRights-CP5fn3_Y.js","assets/MicroMissionCard-DYpLjwta.js","assets/MissionFlows-CWIGDwyZ.js","assets/Missions-BwTHI5KD.js","assets/Missions-CjdrFLCR.css","assets/MorningVision-jP0JHrU2.js","assets/Move-C0PSetJt.css","assets/Move-CeXvRaYP.js","assets/Notebook-CBoomrOh.css","assets/Notebook-Dnd0gak0.js","assets/NotificationPermissionSettings-B-hmtWkI.js","assets/NotificationReminderPrimer-DQCgfoWM.js","assets/Onboarding-CI9R8IOr.css","assets/Onboarding-DcpZ_HXL.js","assets/OnboardingLifeReset-BAg_sQjB.js","assets/Partners-3s78VSDh.css","assets/Partners-C2J4zwrc.js","assets/PersonalWorkPlanView-Dd_0kEZS.js","assets/PlanAreaExplanations-BKzQAQhV.js","assets/PlanLengthChoice-CCwO0B-D.js","assets/PracticeEvidence-8cjpbmJ7.js","assets/PracticeEvidence-D-LQUXjh.css","assets/ProgramEvidence-fr5tbdxo.js","assets/ProgramInviteSetup-CUeKJCrh.js","assets/ProgramPhoto-CDCw5Msh.js","assets/ProgramToday-Cm_CdGjX.js","assets/Programs-CHz6Cpy6.js","assets/ProgressHistory-D1MuhhV0.js","assets/ProgressR51-BF7uhtLl.js","assets/ProgressR51-BG0Toxq8.css","assets/PublicLanguagePicker-BSvfZxO7.js","assets/PublicTwoFutures-DzQJl5ZW.js","assets/PwaUpdatePrompt-Cbj9BxcA.js","assets/QuestWritingAction-GTQXTOAe.js","assets/QuickDreamJournalModal-BYv1egX0.js","assets/QuotesBrowser-Bxb8tdaw.js","assets/ReminderChoices-4G_HTRWp.js","assets/ResetDay-IsVoM0gR.js","assets/ScreenLimits-DgXQw6Lm.js","assets/Settings-9mzH4uSt.js","assets/SoundRenewal-CD7Bm1bA.js","assets/SoundRenewal-DPAJshqf.css","assets/SoundRenewalEvidence-B7o3oXHH.js","assets/SoundRoom-BpE_PH9A.js","assets/SoundRoom-xYFW1H_N.css","assets/SourcesDisclosure-DBfZvk4m.js","assets/SubscriptionReminder-CS49IgYc.js","assets/Support-Dt04T9LR.js","assets/SurveyPlanView-D6k2RpuV.js","assets/SystemDashboard-CqBsmlMI.css","assets/SystemDashboard-DWVfPyOX.js","assets/Today-C1qxj259.js","assets/Today-ComziNgP.css","assets/TodayCheckIn-B8o-boWA.js","assets/TodayMomentum-nxTWe4iO.js","assets/TodayMore-CxPR6Drr.js","assets/Tools-BJZvlTlI.js","assets/TwoFutures-DKvj2Ku9.js","assets/TwoFuturesPulseWidgets-rLdN5_nu.js","assets/TwoFuturesTheme-7EqkiVOa.js","assets/TwoMinuteStart-DqAyhxH9.js","assets/Upgrade-BWSc8Vou.js","assets/Upgrade-rlK9ZaQ8.css","assets/WebAccountAccess-Bvqd-ol1.js","assets/WebBillingReturn-lLXHgcw3.js","assets/WebConsentBanner-Bp68bCAl.js","assets/WebNotFound-DISXZqGT.js","assets/WeeklyOutcomeReview-C8ijiaZ5.js","assets/Withdrawal-nE8CJJr_.js","assets/WorkoutPrograms-B4LdLkiM.css","assets/WorkoutPrograms-DbX1Y4En.js","assets/_oda-optional-coach-speech-Cg0zdh7Q.js","assets/accountDeletion-DZgubhQi.js","assets/activity-CniOSRlN.js","assets/adhd-CuUgTELq.js","assets/adhd-DgksrAfe.js","assets/adhd-DnEPJRO_.js","assets/adhd-fLI1NE1F.js","assets/aiCoach.worker-Bq5jMgiA.js","assets/analyticsConsent-Ax9yqe_D.js","assets/androidNative-o8L9c9-R.js","assets/anton-latin-400-normal-AUNGEG_V.woff","assets/anton-latin-400-normal-Byf51wtH.woff2","assets/anton-latin-ext-400-normal-BMODBQc6.woff","assets/anton-latin-ext-400-normal-SyiqE2Jt.woff2","assets/archive-CazYRjbd.js","assets/arrow-left-BYdOVAIs.js","assets/arrow-right-CTXwCpZu.js","assets/arrow-up-CPi4KJ4Y.js","assets/arrow-up-right-DCIwnEZp.js","assets/atmosphere-BkgC4U5A.js","assets/atmosphere-Cu7944ck.css","assets/atomic-habits-DlAZXGjN.js","assets/audio-lines-BucBsaWd.js","assets/backup-D1vYwSC3.js","assets/backupCopy-Cb-Z2rdm.js","assets/beliefLab-BPZtT2g5.js","assets/beliefLab-DAbKd-LK.js","assets/book-open-BP5KOAA3.js","assets/bookIdeas-BhFxPD8P.js","assets/bookIdeas-DdXiuD2u.css","assets/bookIdeas-xttDtlpZ.js","assets/calendar-days-DDOJUTAw.js","assets/calm-Bbmdhk8O.js","assets/calm-Blx_q4zJ.js","assets/calm-Bz0j48tt.js","assets/calm-D5vzRuTB.js","assets/calmMood-2b97Iv_y.js","assets/cameraCapture-DQiQJD_S.js","assets/charts-CzYGYKmf.js","assets/check-cVxL5QCS.js","assets/checkInR39-7hse4RYo.js","assets/chevron-down-CzAgQVHE.js","assets/chevron-left-BAIr0L4S.js","assets/chevron-right-Crcd9dUI.js","assets/circle-check-DPqI9-V-.js","assets/circle-question-mark-la3T4Tm2.js","assets/clarity-pBID3WTc.js","assets/clock-0jjVKGr8.js","assets/cloudAIConsent-BxppxiGM.js","assets/cloudCoach-Ce8l5y7b.js","assets/cloudReconciliation-J-rmhf2-.js","assets/coach-knowledge-_BtfSmkM.js","assets/coachPrivacy-BA3Rc_br.js","assets/coachR20-BldAYwcw.js","assets/coachReport-DeJKkADq.js","assets/coachV3-DgZbBaLJ.js","assets/coachVoice-M_d4HiMO.js","assets/coachVoicePreferences-054wMRY1.js","assets/companion-De-neic4.js","assets/compassion-4dlwIKKK.js","assets/compassion-BgbU1l9Y.js","assets/compassion-C9RDmfLG.js","assets/compassion-Duq2bCD1.js","assets/confetti-oQXWb4Lk.js","assets/confidence-BIviqCeF.js","assets/confidence-CkilXZY5.js","assets/confidence-D7Irnhp2.js","assets/confidence-DQ_ViaxQ.js","assets/contact-CPDZOjSM.js","assets/conversionR53-pPuYF-ns.js","assets/copy-DALKkb5b.js","assets/course-catalog-de-CegNB7MS.js","assets/course-catalog-en-DM2jdsKz.js","assets/course-catalog-es-BMUPUUKo.js","assets/course-catalog-fr-CLQm0YEK.js","assets/course-catalog-it-j_vwqke0.js","assets/course-catalog-tr-DCWwzbzk.js","assets/courseLearningCopy-CN6mIh6q.js","assets/coursePresentation-CwOLG8FU.js","assets/courses-BvA88lFO.css","assets/courses-CPvLK-V8.js","assets/daily-quotes-B1EI4ztR.js","assets/dataRights-Dkbg64QY.js","assets/de-C2ZTvGuq.js","assets/deep-work-BUapM_NA.js","assets/design-CDW-H5sd.js","assets/download-KcffNf7I.js","assets/drive-BU09gux9.js","assets/dumbbell-DsSnm2jP.js","assets/entitlementLabels-C3j1yI2m.js","assets/es-BuVoDuwt.js","assets/exploreDreamsMeaningful-BUZolCbZ.js","assets/faith-Bba7gwp6.js","assets/faith-Bfjwk-XT.js","assets/faith-XHaXr-Kz.js","assets/faith-jb4ptNVn.js","assets/feather-DZZbvKlE.js","assets/feeling-good-CZ1WPMRp.js","assets/firstMeditation-Dw-MPeum.js","assets/firstSessionHandoff-BRQr5moT.js","assets/focus-9cAehDRa.js","assets/focus-DTydJKdH.js","assets/focus-DluDXwbR.js","assets/focus-DnAMUhn2.js","assets/focusEvidence--0yGImtH.js","assets/focusTimerR35-BbrcJoyY.js","assets/focusTimerR35-DBvFmlw2.js","assets/focusTimerR35-DiAJuCpe.css","assets/footprints-CQfz72WW.js","assets/fr-DCitzETs.js","assets/genai-BNTLQvNw.js","assets/getting-things-done-CrpVvfzk.js","assets/globe-FrsRRfcI.js","assets/growth-CDV6tODQ.js","assets/guidance-dmqdZQEf.js","assets/guidedMeditations-av9aiUno.js","assets/habitEvidence-EepO-rWH.js","assets/habitEvidenceCards-t5v3xLct.js","assets/hanken-grotesk-latin-ext-wght-normal-Dg-wlmqe.woff2","assets/hanken-grotesk-latin-wght-normal-CaVRRdDk.woff2","assets/hanken-grotesk-vietnamese-wght-normal-CHiFlh_0.woff2","assets/headphones-CNsU-rEE.js","assets/identity-CfhyHuFr.js","assets/identity-Cw2FxIRv.js","assets/identity-DkGePd2w.js","assets/identity-yYzusjjY.js","assets/imageDelivery-BVAHxS4X.js","assets/index-5NbIzBIs.js","assets/index-BTg2zEi3.js","assets/index-BuX8SUBd.js","assets/index-C-WCy_jy.js","assets/index-Cgi6DKmr.js","assets/index-D3qei5jq.js","assets/index-D4Dr6GYT.js","assets/index-D9n_9FZ2.js","assets/index-DYd4Zs8x.js","assets/index-D_NXj4bh.js","assets/index-DwgOTO8m.js","assets/index-iX7hNPHJ.js","assets/index-yTx0b_3u.js","assets/indistractable-C_cdk10-.js","assets/info-DP4-GemD.js","assets/iosFeatures-C9dGsti2.js","assets/iosWidgetSnapshot-W1Sb_z88.js","assets/it-DFiEUUb8.js","assets/layout-grid-CAHA_wGL.js","assets/legal-Pkc7C2hC.js","assets/lesson-en-a-f-DI5_dI_X.js","assets/lesson-en-g-m-DCkb9trv.js","assets/lesson-en-n-z-97X-C_U-.js","assets/lesson-tr-a-f-BTi3fg2o.js","assets/lesson-tr-g-m-B6-_Oz13.js","assets/lesson-tr-n-z-BkkEJqor.js","assets/lessonActionSummary-ByMaGhOr.js","assets/lessonPractice-BLK9E_al.js","assets/lifeResetScience-oyc3EupE.js","assets/lock-keyhole-Bj0QveY9.js","assets/mail-Gox3lSbJ.js","assets/main-CgOaLllE.css","assets/main-D88xv7yE.js","assets/manifest-BidHEJ78.js","assets/manifest-BrPc-jKv.js","assets/manifest-CMg1tOFq.js","assets/manifest-DYUt1YcO.js","assets/manifestTechniquePhotos-CkADNGG3.js","assets/mans-search-for-meaning-CwtEPasg.js","assets/meaning-BcueOe9l.js","assets/meaning-Bd3ruPy1.js","assets/meaning-Bzd8HUZl.js","assets/meaning-sO9Ki4VP.js","assets/meditation-BJJcxuTh.js","assets/meditation-BaghGNtU.js","assets/meditation-DBAvw7DT.js","assets/meditation-Dli5Ymcn.js","assets/meditationNarrationAssets-E5TJiCQq.js","assets/meditations-DHm31cQ7.js","assets/memberEnums-DzXSVUSA.js","assets/memberExperience-BQFnKpxx.js","assets/membershipJourney-DrJ2imWG.css","assets/message-circle-DQw69RZC.js","assets/mindset-Bfe4Fgxh.js","assets/miniTools-jcHJ3Lay.css","assets/minus-n1eZNgJ2.js","assets/moon-VXorz2B-.js","assets/motion-C_2nUh32.js","assets/motion-CeyNsMSn.js","assets/motion-CxDRHJhC.css","assets/motivation-BD5_lbop.js","assets/motivation-Beo19K_3.js","assets/motivation-ChKBGhgX.js","assets/motivation-DlQK06zm.js","assets/music-CpPbGaLU.js","assets/nativeAudioMembership-BNOgYhZJ.js","assets/newsreader-latin-ext-opsz-italic-CSPGnFdO.woff2","assets/newsreader-latin-ext-opsz-normal-BQn1nviT.woff2","assets/newsreader-latin-opsz-italic-kJKFiXvB.woff2","assets/newsreader-latin-opsz-normal-s-izfB6B.woff2","assets/newsreader-vietnamese-opsz-italic-DTr-ymY4.woff2","assets/newsreader-vietnamese-opsz-normal-BjhtXyW2.woff2","assets/notebook-pen-ybKtfGEa.js","assets/notification-quotes-CkYBAlCE.js","assets/notificationScheduler-DNjQJFQ3.js","assets/notificationSettings-bqR_frWk.js","assets/onboardingLifeResetContent-Dz6J6iIh.js","assets/onboardingSurvey-xo5emihi.css","assets/optimism-1p_Fx3A2.js","assets/optimism-Cq9kKyFw.js","assets/optimism-Cu1RzE2a.js","assets/optimism-fuUIokmC.js","assets/packageMembership-CBkl38Iu.js","assets/partners-D-hI1YwP.js","assets/partners-DCluOtMF.js","assets/pause-BG6qULdA.js","assets/pen-line-CmB3s93A.js","assets/pencil-B7wQzZa8.js","assets/personalWorkPlan-6hiA5_G7.js","assets/personalWorkPlan-BXopaX26.css","assets/planLength-BYMGaH_B.js","assets/play-D4cdvgrn.js","assets/plus-cmY5n5kL.js","assets/power-positive-thinking-SKT95lBX.js","assets/procrastination-CY2BAjNO.js","assets/procrastination-CdaZT_zV.js","assets/procrastination-DgLcduAQ.js","assets/procrastination-Ssqd3EsS.js","assets/productAnalytics-Kr0zNzHn.js","assets/programs-CUgF_InA.css","assets/progressR51-Dl_E0ir_.js","assets/publicAppContext-DB9NQ6zi.js","assets/publicMain-CRYhynX5.js","assets/purchasesWeb-BmlVot6u.js","assets/pwaRegistration-BIKQ0PVm.js","assets/questActions-D6RVgB7R.js","assets/quote-CcylheMz.js","assets/quoteAttribution-guyevMsL.js","assets/radioGroupKeyboard-BXIYXY2g.js","assets/react-BKeWhvB3.js","assets/recordedNarration-B12LmBSE.js","assets/refresh-cw-CPAg5Mk2.js","assets/resetDay-BmdT_SpR.js","assets/rotate-ccw-jtwlAc6W.js","assets/routineDay-CvAixSLb.js","assets/screenTime-5SchZfIk.css","assets/search-DqebHy-h.js","assets/self-compassion-B2oGEbNG.js","assets/share-2-8kzpRWes.js","assets/share-image-Br7REqB6.js","assets/shared-BnfgQzII.js","assets/shuffle-C4ZikkVj.js","assets/sleep-B-HQJT19.js","assets/sleep-CWMF0jqp.js","assets/sleep-eMGG1Xco.js","assets/sleep-g56rgYNn.js","assets/soundRoomPlayer-DNc8Qkxm.js","assets/soundSessionIntent-C1_j88SP.js","assets/sparkles-DDDqis1Y.js","assets/sprout-DXTfjrkG.js","assets/square-BkJfyHGm.js","assets/star-19fjsnff.js","assets/state-BHgS_N6o.js","assets/state-C1zIdMO2.js","assets/state-D81goSg-.js","assets/state-b1okS-7_.js","assets/stoic-BDTKUXlf.js","assets/stoic-Ch222Ya9.js","assets/stoic-DfPBKUXo.js","assets/stoic-Dk9Aojc1.js","assets/subscriptionManagement-vW_QKLXd.js","assets/suggestion-BBaigV7e.js","assets/suggestion-CsIFV_TA.js","assets/suggestion-CyytpDo-.js","assets/suggestion-hQAO2P5E.js","assets/sun-4TQo7aJ3.js","assets/sunrise-CxY0vhU4.js","assets/supabase-CkgSuUy_.js","assets/support-MncVjUZI.js","assets/supportInfo-D_nb2hPx.js","assets/supportR35-gsMbC2Qx.js","assets/sysVisual-CwDOOMW7.js","assets/sysVisual-JLNJ_Wl5.js","assets/the-secret-ChzIs8Bp.js","assets/think-and-grow-rich-CUZ7_3LO.js","assets/timer-CcOQAKnX.js","assets/tiny-habits-Ce1eV6XA.js","assets/tiny-invariant-DZDH8WIo.js","assets/tr-CJxhsfKA.js","assets/trash-2-DDsbMNuW.js","assets/trending-up-BMYaRPk0.js","assets/turning-day-Ba_3GIM8.js","assets/turning-day-Csle5AYS.js","assets/turning-day-DKGCiCdA.js","assets/turning-day-Dw72xBpM.js","assets/upload-DoHwjbAJ.js","assets/useApp-p-MFIHJ2.js","assets/voiceConsent-K-_f_Z3F.js","assets/volume-2-QosHozrL.js","assets/waves-Cpfsb073.js","assets/web--4fksBjt.js","assets/web-B3j83t9P.js","assets/web-C1IJpASL.js","assets/web-DI0bzakl.js","assets/web-DW0Fh0u7.js","assets/webBilling-u07eO3Gm.js","assets/webCheckoutConsent-V8UR5Yjj.js","assets/webConsent-CeKVcwEj.css","assets/why-we-sleep-DBg-Fvo6.js","assets/wind-IBQjU5Yn.js","assets/workingSurfaces-973wqgG5.css","assets/workoutPrograms-Bsd_cqlO.js","assets/workoutPrograms-C5cQBMcD.js","assets/zap-OLSsS1bQ.js"],"precache":["assets/AppShell-C9mN4jr5.css","assets/AppShell-CUEQrXmb.js","assets/FutureNote-CBceFM_j.css","assets/FutureNote-M3iFHkLM.js","assets/Landing-C9ACQ0FJ.css","assets/Landing-DnJ-T6dh.js","assets/MemberHabitEvidence-Dv7qcCes.js","assets/NotificationReminderPrimer-DQCgfoWM.js","assets/Onboarding-CI9R8IOr.css","assets/Onboarding-DcpZ_HXL.js","assets/OnboardingLifeReset-BAg_sQjB.js","assets/PersonalWorkPlanView-Dd_0kEZS.js","assets/PlanAreaExplanations-BKzQAQhV.js","assets/PlanLengthChoice-CCwO0B-D.js","assets/ProgramInviteSetup-CUeKJCrh.js","assets/ProgramPhoto-CDCw5Msh.js","assets/ProgressR51-BF7uhtLl.js","assets/ProgressR51-BG0Toxq8.css","assets/PublicLanguagePicker-BSvfZxO7.js","assets/PwaUpdatePrompt-Cbj9BxcA.js","assets/ReminderChoices-4G_HTRWp.js","assets/SourcesDisclosure-DBfZvk4m.js","assets/SurveyPlanView-D6k2RpuV.js","assets/SystemDashboard-CqBsmlMI.css","assets/SystemDashboard-DWVfPyOX.js","assets/Today-C1qxj259.js","assets/Today-ComziNgP.css","assets/TwoFuturesTheme-7EqkiVOa.js","assets/accountDeletion-DZgubhQi.js","assets/activity-CniOSRlN.js","assets/analyticsConsent-Ax9yqe_D.js","assets/androidNative-o8L9c9-R.js","assets/anton-latin-400-normal-Byf51wtH.woff2","assets/anton-latin-ext-400-normal-SyiqE2Jt.woff2","assets/arrow-left-BYdOVAIs.js","assets/arrow-right-CTXwCpZu.js","assets/arrow-up-CPi4KJ4Y.js","assets/arrow-up-right-DCIwnEZp.js","assets/atmosphere-BkgC4U5A.js","assets/atmosphere-Cu7944ck.css","assets/book-open-BP5KOAA3.js","assets/calendar-days-DDOJUTAw.js","assets/calmMood-2b97Iv_y.js","assets/check-cVxL5QCS.js","assets/checkInR39-7hse4RYo.js","assets/chevron-down-CzAgQVHE.js","assets/chevron-left-BAIr0L4S.js","assets/chevron-right-Crcd9dUI.js","assets/circle-check-DPqI9-V-.js","assets/circle-question-mark-la3T4Tm2.js","assets/clock-0jjVKGr8.js","assets/cloudAIConsent-BxppxiGM.js","assets/coachPrivacy-BA3Rc_br.js","assets/coachReport-DeJKkADq.js","assets/confetti-oQXWb4Lk.js","assets/contact-CPDZOjSM.js","assets/conversionR53-pPuYF-ns.js","assets/course-catalog-en-DM2jdsKz.js","assets/design-CDW-H5sd.js","assets/exploreDreamsMeaningful-BUZolCbZ.js","assets/firstMeditation-Dw-MPeum.js","assets/firstSessionHandoff-BRQr5moT.js","assets/focusTimerR35-BbrcJoyY.js","assets/globe-FrsRRfcI.js","assets/guidedMeditations-av9aiUno.js","assets/habitEvidence-EepO-rWH.js","assets/habitEvidenceCards-t5v3xLct.js","assets/hanken-grotesk-latin-ext-wght-normal-Dg-wlmqe.woff2","assets/hanken-grotesk-latin-wght-normal-CaVRRdDk.woff2","assets/index-BuX8SUBd.js","assets/index-C-WCy_jy.js","assets/info-DP4-GemD.js","assets/legal-Pkc7C2hC.js","assets/lessonPractice-BLK9E_al.js","assets/lifeResetScience-oyc3EupE.js","assets/lock-keyhole-Bj0QveY9.js","assets/mail-Gox3lSbJ.js","assets/main-CgOaLllE.css","assets/main-D88xv7yE.js","assets/membershipJourney-DrJ2imWG.css","assets/message-circle-DQw69RZC.js","assets/moon-VXorz2B-.js","assets/newsreader-latin-ext-opsz-italic-CSPGnFdO.woff2","assets/newsreader-latin-ext-opsz-normal-BQn1nviT.woff2","assets/newsreader-latin-opsz-italic-kJKFiXvB.woff2","assets/newsreader-latin-opsz-normal-s-izfB6B.woff2","assets/notebook-pen-ybKtfGEa.js","assets/notification-quotes-CkYBAlCE.js","assets/notificationScheduler-DNjQJFQ3.js","assets/notificationSettings-bqR_frWk.js","assets/onboardingLifeResetContent-Dz6J6iIh.js","assets/onboardingSurvey-xo5emihi.css","assets/packageMembership-CBkl38Iu.js","assets/partners-D-hI1YwP.js","assets/partners-DCluOtMF.js","assets/pause-BG6qULdA.js","assets/pen-line-CmB3s93A.js","assets/personalWorkPlan-6hiA5_G7.js","assets/personalWorkPlan-BXopaX26.css","assets/planLength-BYMGaH_B.js","assets/play-D4cdvgrn.js","assets/productAnalytics-Kr0zNzHn.js","assets/progressR51-Dl_E0ir_.js","assets/publicAppContext-DB9NQ6zi.js","assets/publicMain-CRYhynX5.js","assets/pwaRegistration-BIKQ0PVm.js","assets/questActions-D6RVgB7R.js","assets/react-BKeWhvB3.js","assets/rotate-ccw-jtwlAc6W.js","assets/routineDay-CvAixSLb.js","assets/share-2-8kzpRWes.js","assets/shared-BnfgQzII.js","assets/sparkles-DDDqis1Y.js","assets/sprout-DXTfjrkG.js","assets/star-19fjsnff.js","assets/sun-4TQo7aJ3.js","assets/sysVisual-CwDOOMW7.js","assets/sysVisual-JLNJ_Wl5.js","assets/timer-CcOQAKnX.js","assets/trash-2-DDsbMNuW.js","assets/trending-up-BMYaRPk0.js","assets/useApp-p-MFIHJ2.js","assets/waves-Cpfsb073.js","assets/workoutPrograms-Bsd_cqlO.js","assets/workoutPrograms-C5cQBMcD.js","assets/zap-OLSsS1bQ.js"],"documents":[{"kind":"landing","file":"de/index.html","url":"de/","paths":["de","de/","de/index.html"]},{"kind":"public","file":"de/delete-account/index.html","url":"de/delete-account/","paths":["de/delete-account","de/delete-account/","de/delete-account/index.html"]},{"kind":"public","file":"de/privacy/index.html","url":"de/privacy/","paths":["de/privacy","de/privacy/","de/privacy/index.html"]},{"kind":"public","file":"de/support/index.html","url":"de/support/","paths":["de/support","de/support/","de/support/index.html"]},{"kind":"public","file":"de/terms/index.html","url":"de/terms/","paths":["de/terms","de/terms/","de/terms/index.html"]},{"kind":"public","file":"delete-account/index.html","url":"delete-account/","paths":["delete-account","delete-account/","delete-account/index.html","en/delete-account","en/delete-account/","en/delete-account/index.html"]},{"kind":"public","file":"en/privacy/index.html","url":"en/privacy/","paths":["en/privacy","en/privacy/","en/privacy/index.html"]},{"kind":"public","file":"en/support/index.html","url":"en/support/","paths":["en/support","en/support/","en/support/index.html"]},{"kind":"public","file":"en/terms/index.html","url":"en/terms/","paths":["en/terms","en/terms/","en/terms/index.html"]},{"kind":"landing","file":"es/index.html","url":"es/","paths":["es","es/","es/index.html"]},{"kind":"public","file":"es/delete-account/index.html","url":"es/delete-account/","paths":["es/delete-account","es/delete-account/","es/delete-account/index.html"]},{"kind":"public","file":"es/privacy/index.html","url":"es/privacy/","paths":["es/privacy","es/privacy/","es/privacy/index.html"]},{"kind":"public","file":"es/support/index.html","url":"es/support/","paths":["es/support","es/support/","es/support/index.html"]},{"kind":"public","file":"es/terms/index.html","url":"es/terms/","paths":["es/terms","es/terms/","es/terms/index.html"]},{"kind":"landing","file":"fr/index.html","url":"fr/","paths":["fr","fr/","fr/index.html"]},{"kind":"public","file":"fr/delete-account/index.html","url":"fr/delete-account/","paths":["fr/delete-account","fr/delete-account/","fr/delete-account/index.html"]},{"kind":"public","file":"fr/privacy/index.html","url":"fr/privacy/","paths":["fr/privacy","fr/privacy/","fr/privacy/index.html"]},{"kind":"public","file":"fr/support/index.html","url":"fr/support/","paths":["fr/support","fr/support/","fr/support/index.html"]},{"kind":"public","file":"fr/terms/index.html","url":"fr/terms/","paths":["fr/terms","fr/terms/","fr/terms/index.html"]},{"kind":"member","file":"index.html","url":"index.html","paths":["","app","app/","app/account","app/account/","app/bank","app/bank/","app/belief","app/belief/","app/billing","app/billing/","app/billing/cancel","app/billing/cancel/","app/billing/return","app/billing/return/","app/billing/success","app/billing/success/","app/book-ideas","app/book-ideas/","app/book-ideas/atomic-habits","app/book-ideas/atomic-habits/","app/book-ideas/course/adhd","app/book-ideas/course/adhd/","app/book-ideas/course/compassion","app/book-ideas/course/compassion/","app/book-ideas/course/confidence","app/book-ideas/course/confidence/","app/book-ideas/course/focus","app/book-ideas/course/focus/","app/book-ideas/course/identity","app/book-ideas/course/identity/","app/book-ideas/course/manifest","app/book-ideas/course/manifest/","app/book-ideas/course/meaning","app/book-ideas/course/meaning/","app/book-ideas/course/motivation","app/book-ideas/course/motivation/","app/book-ideas/course/optimism","app/book-ideas/course/optimism/","app/book-ideas/course/procrastination","app/book-ideas/course/procrastination/","app/book-ideas/course/sleep","app/book-ideas/course/sleep/","app/book-ideas/course/stoic","app/book-ideas/course/stoic/","app/book-ideas/course/suggestion","app/book-ideas/course/suggestion/","app/book-ideas/course/turning-day","app/book-ideas/course/turning-day/","app/book-ideas/deep-work","app/book-ideas/deep-work/","app/book-ideas/drive","app/book-ideas/drive/","app/book-ideas/feeling-good","app/book-ideas/feeling-good/","app/book-ideas/getting-things-done","app/book-ideas/getting-things-done/","app/book-ideas/indistractable","app/book-ideas/indistractable/","app/book-ideas/mans-search-for-meaning","app/book-ideas/mans-search-for-meaning/","app/book-ideas/meditations","app/book-ideas/meditations/","app/book-ideas/mindset","app/book-ideas/mindset/","app/book-ideas/power-positive-thinking","app/book-ideas/power-positive-thinking/","app/book-ideas/self-compassion","app/book-ideas/self-compassion/","app/book-ideas/the-secret","app/book-ideas/the-secret/","app/book-ideas/think-and-grow-rich","app/book-ideas/think-and-grow-rich/","app/book-ideas/tiny-habits","app/book-ideas/tiny-habits/","app/book-ideas/why-we-sleep","app/book-ideas/why-we-sleep/","app/bridge","app/bridge/","app/budget","app/budget/","app/coach","app/coach/","app/courses","app/courses/","app/courses/adhd","app/courses/adhd/","app/courses/adhd/lesson/1","app/courses/adhd/lesson/1/","app/courses/adhd/lesson/2","app/courses/adhd/lesson/2/","app/courses/adhd/lesson/3","app/courses/adhd/lesson/3/","app/courses/adhd/lesson/4","app/courses/adhd/lesson/4/","app/courses/adhd/lesson/5","app/courses/adhd/lesson/5/","app/courses/adhd/lesson/adhd-1","app/courses/adhd/lesson/adhd-1/","app/courses/adhd/lesson/adhd-2","app/courses/adhd/lesson/adhd-2/","app/courses/adhd/lesson/adhd-3","app/courses/adhd/lesson/adhd-3/","app/courses/adhd/lesson/adhd-4","app/courses/adhd/lesson/adhd-4/","app/courses/adhd/lesson/adhd-5","app/courses/adhd/lesson/adhd-5/","app/courses/calm","app/courses/calm/","app/courses/calm/lesson/1","app/courses/calm/lesson/1/","app/courses/calm/lesson/2","app/courses/calm/lesson/2/","app/courses/calm/lesson/3","app/courses/calm/lesson/3/","app/courses/calm/lesson/4","app/courses/calm/lesson/4/","app/courses/calm/lesson/5","app/courses/calm/lesson/5/","app/courses/calm/lesson/calm-1","app/courses/calm/lesson/calm-1/","app/courses/calm/lesson/calm-2","app/courses/calm/lesson/calm-2/","app/courses/calm/lesson/calm-3","app/courses/calm/lesson/calm-3/","app/courses/calm/lesson/calm-4","app/courses/calm/lesson/calm-4/","app/courses/calm/lesson/calm-5","app/courses/calm/lesson/calm-5/","app/courses/compassion","app/courses/compassion/","app/courses/compassion/lesson/1","app/courses/compassion/lesson/1/","app/courses/compassion/lesson/2","app/courses/compassion/lesson/2/","app/courses/compassion/lesson/3","app/courses/compassion/lesson/3/","app/courses/compassion/lesson/4","app/courses/compassion/lesson/4/","app/courses/compassion/lesson/5","app/courses/compassion/lesson/5/","app/courses/compassion/lesson/6","app/courses/compassion/lesson/6/","app/courses/compassion/lesson/compassion-1","app/courses/compassion/lesson/compassion-1/","app/courses/compassion/lesson/compassion-2","app/courses/compassion/lesson/compassion-2/","app/courses/compassion/lesson/compassion-3","app/courses/compassion/lesson/compassion-3/","app/courses/compassion/lesson/compassion-4","app/courses/compassion/lesson/compassion-4/","app/courses/compassion/lesson/compassion-5","app/courses/compassion/lesson/compassion-5/","app/courses/compassion/lesson/compassion-6","app/courses/compassion/lesson/compassion-6/","app/courses/confidence","app/courses/confidence/","app/courses/confidence/lesson/1","app/courses/confidence/lesson/1/","app/courses/confidence/lesson/2","app/courses/confidence/lesson/2/","app/courses/confidence/lesson/3","app/courses/confidence/lesson/3/","app/courses/confidence/lesson/4","app/courses/confidence/lesson/4/","app/courses/confidence/lesson/5","app/courses/confidence/lesson/5/","app/courses/confidence/lesson/confidence-1","app/courses/confidence/lesson/confidence-1/","app/courses/confidence/lesson/confidence-2","app/courses/confidence/lesson/confidence-2/","app/courses/confidence/lesson/confidence-3","app/courses/confidence/lesson/confidence-3/","app/courses/confidence/lesson/confidence-4","app/courses/confidence/lesson/confidence-4/","app/courses/confidence/lesson/confidence-5","app/courses/confidence/lesson/confidence-5/","app/courses/faith","app/courses/faith/","app/courses/faith/lesson/1","app/courses/faith/lesson/1/","app/courses/faith/lesson/2","app/courses/faith/lesson/2/","app/courses/faith/lesson/3","app/courses/faith/lesson/3/","app/courses/faith/lesson/4","app/courses/faith/lesson/4/","app/courses/faith/lesson/5","app/courses/faith/lesson/5/","app/courses/faith/lesson/faith-1","app/courses/faith/lesson/faith-1/","app/courses/faith/lesson/faith-2","app/courses/faith/lesson/faith-2/","app/courses/faith/lesson/faith-3","app/courses/faith/lesson/faith-3/","app/courses/faith/lesson/faith-4","app/courses/faith/lesson/faith-4/","app/courses/faith/lesson/faith-5","app/courses/faith/lesson/faith-5/","app/courses/focus","app/courses/focus/","app/courses/focus/lesson/1","app/courses/focus/lesson/1/","app/courses/focus/lesson/2","app/courses/focus/lesson/2/","app/courses/focus/lesson/3","app/courses/focus/lesson/3/","app/courses/focus/lesson/4","app/courses/focus/lesson/4/","app/courses/focus/lesson/5","app/courses/focus/lesson/5/","app/courses/focus/lesson/focus-1","app/courses/focus/lesson/focus-1/","app/courses/focus/lesson/focus-2","app/courses/focus/lesson/focus-2/","app/courses/focus/lesson/focus-3","app/courses/focus/lesson/focus-3/","app/courses/focus/lesson/focus-4","app/courses/focus/lesson/focus-4/","app/courses/focus/lesson/focus-5","app/courses/focus/lesson/focus-5/","app/courses/identity","app/courses/identity/","app/courses/identity/lesson/1","app/courses/identity/lesson/1/","app/courses/identity/lesson/2","app/courses/identity/lesson/2/","app/courses/identity/lesson/3","app/courses/identity/lesson/3/","app/courses/identity/lesson/4","app/courses/identity/lesson/4/","app/courses/identity/lesson/5","app/courses/identity/lesson/5/","app/courses/identity/lesson/6","app/courses/identity/lesson/6/","app/courses/identity/lesson/7","app/courses/identity/lesson/7/","app/courses/identity/lesson/identity-1","app/courses/identity/lesson/identity-1/","app/courses/identity/lesson/identity-2","app/courses/identity/lesson/identity-2/","app/courses/identity/lesson/identity-3","app/courses/identity/lesson/identity-3/","app/courses/identity/lesson/identity-4","app/courses/identity/lesson/identity-4/","app/courses/identity/lesson/identity-5","app/courses/identity/lesson/identity-5/","app/courses/identity/lesson/identity-6","app/courses/identity/lesson/identity-6/","app/courses/identity/lesson/identity-7","app/courses/identity/lesson/identity-7/","app/courses/manifest","app/courses/manifest/","app/courses/manifest/lesson/1","app/courses/manifest/lesson/1/","app/courses/manifest/lesson/10","app/courses/manifest/lesson/10/","app/courses/manifest/lesson/11","app/courses/manifest/lesson/11/","app/courses/manifest/lesson/12","app/courses/manifest/lesson/12/","app/courses/manifest/lesson/13","app/courses/manifest/lesson/13/","app/courses/manifest/lesson/14","app/courses/manifest/lesson/14/","app/courses/manifest/lesson/15","app/courses/manifest/lesson/15/","app/courses/manifest/lesson/16","app/courses/manifest/lesson/16/","app/courses/manifest/lesson/17","app/courses/manifest/lesson/17/","app/courses/manifest/lesson/18","app/courses/manifest/lesson/18/","app/courses/manifest/lesson/19","app/courses/manifest/lesson/19/","app/courses/manifest/lesson/2","app/courses/manifest/lesson/2/","app/courses/manifest/lesson/20","app/courses/manifest/lesson/20/","app/courses/manifest/lesson/3","app/courses/manifest/lesson/3/","app/courses/manifest/lesson/4","app/courses/manifest/lesson/4/","app/courses/manifest/lesson/5","app/courses/manifest/lesson/5/","app/courses/manifest/lesson/6","app/courses/manifest/lesson/6/","app/courses/manifest/lesson/7","app/courses/manifest/lesson/7/","app/courses/manifest/lesson/8","app/courses/manifest/lesson/8/","app/courses/manifest/lesson/9","app/courses/manifest/lesson/9/","app/courses/manifest/lesson/manifest-1","app/courses/manifest/lesson/manifest-1/","app/courses/manifest/lesson/manifest-10","app/courses/manifest/lesson/manifest-10/","app/courses/manifest/lesson/manifest-11","app/courses/manifest/lesson/manifest-11/","app/courses/manifest/lesson/manifest-12","app/courses/manifest/lesson/manifest-12/","app/courses/manifest/lesson/manifest-13","app/courses/manifest/lesson/manifest-13/","app/courses/manifest/lesson/manifest-14","app/courses/manifest/lesson/manifest-14/","app/courses/manifest/lesson/manifest-15","app/courses/manifest/lesson/manifest-15/","app/courses/manifest/lesson/manifest-16","app/courses/manifest/lesson/manifest-16/","app/courses/manifest/lesson/manifest-17","app/courses/manifest/lesson/manifest-17/","app/courses/manifest/lesson/manifest-18","app/courses/manifest/lesson/manifest-18/","app/courses/manifest/lesson/manifest-19","app/courses/manifest/lesson/manifest-19/","app/courses/manifest/lesson/manifest-2","app/courses/manifest/lesson/manifest-2/","app/courses/manifest/lesson/manifest-20","app/courses/manifest/lesson/manifest-20/","app/courses/manifest/lesson/manifest-3","app/courses/manifest/lesson/manifest-3/","app/courses/manifest/lesson/manifest-4","app/courses/manifest/lesson/manifest-4/","app/courses/manifest/lesson/manifest-5","app/courses/manifest/lesson/manifest-5/","app/courses/manifest/lesson/manifest-6","app/courses/manifest/lesson/manifest-6/","app/courses/manifest/lesson/manifest-7","app/courses/manifest/lesson/manifest-7/","app/courses/manifest/lesson/manifest-8","app/courses/manifest/lesson/manifest-8/","app/courses/manifest/lesson/manifest-9","app/courses/manifest/lesson/manifest-9/","app/courses/meaning","app/courses/meaning/","app/courses/meaning/lesson/1","app/courses/meaning/lesson/1/","app/courses/meaning/lesson/2","app/courses/meaning/lesson/2/","app/courses/meaning/lesson/3","app/courses/meaning/lesson/3/","app/courses/meaning/lesson/4","app/courses/meaning/lesson/4/","app/courses/meaning/lesson/5","app/courses/meaning/lesson/5/","app/courses/meaning/lesson/6","app/courses/meaning/lesson/6/","app/courses/meaning/lesson/meaning-1","app/courses/meaning/lesson/meaning-1/","app/courses/meaning/lesson/meaning-2","app/courses/meaning/lesson/meaning-2/","app/courses/meaning/lesson/meaning-3","app/courses/meaning/lesson/meaning-3/","app/courses/meaning/lesson/meaning-4","app/courses/meaning/lesson/meaning-4/","app/courses/meaning/lesson/meaning-5","app/courses/meaning/lesson/meaning-5/","app/courses/meaning/lesson/meaning-6","app/courses/meaning/lesson/meaning-6/","app/courses/meditation","app/courses/meditation/","app/courses/meditation/lesson/1","app/courses/meditation/lesson/1/","app/courses/meditation/lesson/2","app/courses/meditation/lesson/2/","app/courses/meditation/lesson/3","app/courses/meditation/lesson/3/","app/courses/meditation/lesson/4","app/courses/meditation/lesson/4/","app/courses/meditation/lesson/5","app/courses/meditation/lesson/5/","app/courses/meditation/lesson/6","app/courses/meditation/lesson/6/","app/courses/meditation/lesson/7","app/courses/meditation/lesson/7/","app/courses/meditation/lesson/meditation-1","app/courses/meditation/lesson/meditation-1/","app/courses/meditation/lesson/meditation-2","app/courses/meditation/lesson/meditation-2/","app/courses/meditation/lesson/meditation-3","app/courses/meditation/lesson/meditation-3/","app/courses/meditation/lesson/meditation-4","app/courses/meditation/lesson/meditation-4/","app/courses/meditation/lesson/meditation-5","app/courses/meditation/lesson/meditation-5/","app/courses/meditation/lesson/meditation-6","app/courses/meditation/lesson/meditation-6/","app/courses/meditation/lesson/meditation-7","app/courses/meditation/lesson/meditation-7/","app/courses/motivation","app/courses/motivation/","app/courses/motivation/lesson/1","app/courses/motivation/lesson/1/","app/courses/motivation/lesson/2","app/courses/motivation/lesson/2/","app/courses/motivation/lesson/3","app/courses/motivation/lesson/3/","app/courses/motivation/lesson/4","app/courses/motivation/lesson/4/","app/courses/motivation/lesson/5","app/courses/motivation/lesson/5/","app/courses/motivation/lesson/motivation-1","app/courses/motivation/lesson/motivation-1/","app/courses/motivation/lesson/motivation-2","app/courses/motivation/lesson/motivation-2/","app/courses/motivation/lesson/motivation-3","app/courses/motivation/lesson/motivation-3/","app/courses/motivation/lesson/motivation-4","app/courses/motivation/lesson/motivation-4/","app/courses/motivation/lesson/motivation-5","app/courses/motivation/lesson/motivation-5/","app/courses/optimism","app/courses/optimism/","app/courses/optimism/lesson/1","app/courses/optimism/lesson/1/","app/courses/optimism/lesson/2","app/courses/optimism/lesson/2/","app/courses/optimism/lesson/3","app/courses/optimism/lesson/3/","app/courses/optimism/lesson/4","app/courses/optimism/lesson/4/","app/courses/optimism/lesson/5","app/courses/optimism/lesson/5/","app/courses/optimism/lesson/6","app/courses/optimism/lesson/6/","app/courses/optimism/lesson/optimism-1","app/courses/optimism/lesson/optimism-1/","app/courses/optimism/lesson/optimism-2","app/courses/optimism/lesson/optimism-2/","app/courses/optimism/lesson/optimism-3","app/courses/optimism/lesson/optimism-3/","app/courses/optimism/lesson/optimism-4","app/courses/optimism/lesson/optimism-4/","app/courses/optimism/lesson/optimism-5","app/courses/optimism/lesson/optimism-5/","app/courses/optimism/lesson/optimism-6","app/courses/optimism/lesson/optimism-6/","app/courses/procrastination","app/courses/procrastination/","app/courses/procrastination/lesson/1","app/courses/procrastination/lesson/1/","app/courses/procrastination/lesson/2","app/courses/procrastination/lesson/2/","app/courses/procrastination/lesson/3","app/courses/procrastination/lesson/3/","app/courses/procrastination/lesson/4","app/courses/procrastination/lesson/4/","app/courses/procrastination/lesson/5","app/courses/procrastination/lesson/5/","app/courses/procrastination/lesson/procrastination-1","app/courses/procrastination/lesson/procrastination-1/","app/courses/procrastination/lesson/procrastination-2","app/courses/procrastination/lesson/procrastination-2/","app/courses/procrastination/lesson/procrastination-3","app/courses/procrastination/lesson/procrastination-3/","app/courses/procrastination/lesson/procrastination-4","app/courses/procrastination/lesson/procrastination-4/","app/courses/procrastination/lesson/procrastination-5","app/courses/procrastination/lesson/procrastination-5/","app/courses/sleep","app/courses/sleep/","app/courses/sleep/lesson/1","app/courses/sleep/lesson/1/","app/courses/sleep/lesson/2","app/courses/sleep/lesson/2/","app/courses/sleep/lesson/3","app/courses/sleep/lesson/3/","app/courses/sleep/lesson/4","app/courses/sleep/lesson/4/","app/courses/sleep/lesson/5","app/courses/sleep/lesson/5/","app/courses/sleep/lesson/sleep-1","app/courses/sleep/lesson/sleep-1/","app/courses/sleep/lesson/sleep-2","app/courses/sleep/lesson/sleep-2/","app/courses/sleep/lesson/sleep-3","app/courses/sleep/lesson/sleep-3/","app/courses/sleep/lesson/sleep-4","app/courses/sleep/lesson/sleep-4/","app/courses/sleep/lesson/sleep-5","app/courses/sleep/lesson/sleep-5/","app/courses/state","app/courses/state/","app/courses/state/lesson/1","app/courses/state/lesson/1/","app/courses/state/lesson/2","app/courses/state/lesson/2/","app/courses/state/lesson/3","app/courses/state/lesson/3/","app/courses/state/lesson/4","app/courses/state/lesson/4/","app/courses/state/lesson/5","app/courses/state/lesson/5/","app/courses/state/lesson/6","app/courses/state/lesson/6/","app/courses/state/lesson/7","app/courses/state/lesson/7/","app/courses/state/lesson/state-1","app/courses/state/lesson/state-1/","app/courses/state/lesson/state-2","app/courses/state/lesson/state-2/","app/courses/state/lesson/state-3","app/courses/state/lesson/state-3/","app/courses/state/lesson/state-4","app/courses/state/lesson/state-4/","app/courses/state/lesson/state-5","app/courses/state/lesson/state-5/","app/courses/state/lesson/state-6","app/courses/state/lesson/state-6/","app/courses/state/lesson/state-7","app/courses/state/lesson/state-7/","app/courses/stoic","app/courses/stoic/","app/courses/stoic/lesson/1","app/courses/stoic/lesson/1/","app/courses/stoic/lesson/2","app/courses/stoic/lesson/2/","app/courses/stoic/lesson/3","app/courses/stoic/lesson/3/","app/courses/stoic/lesson/4","app/courses/stoic/lesson/4/","app/courses/stoic/lesson/5","app/courses/stoic/lesson/5/","app/courses/stoic/lesson/6","app/courses/stoic/lesson/6/","app/courses/stoic/lesson/stoic-1","app/courses/stoic/lesson/stoic-1/","app/courses/stoic/lesson/stoic-2","app/courses/stoic/lesson/stoic-2/","app/courses/stoic/lesson/stoic-3","app/courses/stoic/lesson/stoic-3/","app/courses/stoic/lesson/stoic-4","app/courses/stoic/lesson/stoic-4/","app/courses/stoic/lesson/stoic-5","app/courses/stoic/lesson/stoic-5/","app/courses/stoic/lesson/stoic-6","app/courses/stoic/lesson/stoic-6/","app/courses/suggestion","app/courses/suggestion/","app/courses/suggestion/lesson/1","app/courses/suggestion/lesson/1/","app/courses/suggestion/lesson/2","app/courses/suggestion/lesson/2/","app/courses/suggestion/lesson/3","app/courses/suggestion/lesson/3/","app/courses/suggestion/lesson/4","app/courses/suggestion/lesson/4/","app/courses/suggestion/lesson/5","app/courses/suggestion/lesson/5/","app/courses/suggestion/lesson/6","app/courses/suggestion/lesson/6/","app/courses/suggestion/lesson/7","app/courses/suggestion/lesson/7/","app/courses/suggestion/lesson/suggestion-1","app/courses/suggestion/lesson/suggestion-1/","app/courses/suggestion/lesson/suggestion-2","app/courses/suggestion/lesson/suggestion-2/","app/courses/suggestion/lesson/suggestion-3","app/courses/suggestion/lesson/suggestion-3/","app/courses/suggestion/lesson/suggestion-4","app/courses/suggestion/lesson/suggestion-4/","app/courses/suggestion/lesson/suggestion-5","app/courses/suggestion/lesson/suggestion-5/","app/courses/suggestion/lesson/suggestion-6","app/courses/suggestion/lesson/suggestion-6/","app/courses/suggestion/lesson/suggestion-7","app/courses/suggestion/lesson/suggestion-7/","app/courses/turning-day","app/courses/turning-day/","app/courses/turning-day/lesson/1","app/courses/turning-day/lesson/1/","app/courses/turning-day/lesson/2","app/courses/turning-day/lesson/2/","app/courses/turning-day/lesson/3","app/courses/turning-day/lesson/3/","app/courses/turning-day/lesson/4","app/courses/turning-day/lesson/4/","app/courses/turning-day/lesson/5","app/courses/turning-day/lesson/5/","app/courses/turning-day/lesson/6","app/courses/turning-day/lesson/6/","app/courses/turning-day/lesson/turning-day-1","app/courses/turning-day/lesson/turning-day-1/","app/courses/turning-day/lesson/turning-day-2","app/courses/turning-day/lesson/turning-day-2/","app/courses/turning-day/lesson/turning-day-3","app/courses/turning-day/lesson/turning-day-3/","app/courses/turning-day/lesson/turning-day-4","app/courses/turning-day/lesson/turning-day-4/","app/courses/turning-day/lesson/turning-day-5","app/courses/turning-day/lesson/turning-day-5/","app/courses/turning-day/lesson/turning-day-6","app/courses/turning-day/lesson/turning-day-6/","app/dreams","app/dreams/","app/evidence","app/evidence/","app/focus","app/focus/","app/future-self","app/future-self/","app/index.html","app/insights","app/insights/","app/life","app/life-score","app/life-score/","app/life/","app/locked","app/locked/","app/market","app/market/","app/me","app/me/","app/missions","app/missions/","app/move","app/move/","app/notebook","app/notebook/","app/programs","app/programs/","app/progress","app/progress/","app/reset","app/reset/","app/score","app/score/","app/screen-limits","app/screen-limits/","app/seasons","app/seasons/","app/settings","app/settings/","app/settings/summary","app/settings/summary/","app/sound","app/sound-renewal","app/sound-renewal/","app/sound/","app/summary","app/summary/","app/support","app/support/","app/system","app/system/","app/today","app/today/","app/tools","app/tools/","app/two-futures","app/two-futures/","app/upgrade","app/upgrade/","app/withdrawal","app/withdrawal/","index.html","two-futures","two-futures/"]},{"kind":"landing","file":"it/index.html","url":"it/","paths":["it","it/","it/index.html"]},{"kind":"public","file":"it/delete-account/index.html","url":"it/delete-account/","paths":["it/delete-account","it/delete-account/","it/delete-account/index.html"]},{"kind":"public","file":"it/privacy/index.html","url":"it/privacy/","paths":["it/privacy","it/privacy/","it/privacy/index.html"]},{"kind":"public","file":"it/support/index.html","url":"it/support/","paths":["it/support","it/support/","it/support/index.html"]},{"kind":"public","file":"it/terms/index.html","url":"it/terms/","paths":["it/terms","it/terms/","it/terms/index.html"]},{"kind":"public","file":"legal/account-deletion.html","url":"legal/account-deletion.html","paths":["legal/account-deletion","legal/account-deletion.html"]},{"kind":"public","file":"legal/de/account-deletion.html","url":"legal/de/account-deletion.html","paths":["legal/de/account-deletion","legal/de/account-deletion.html"]},{"kind":"public","file":"legal/de/imprint.html","url":"legal/de/imprint.html","paths":["legal/de/imprint","legal/de/imprint.html"]},{"kind":"public","file":"legal/de/privacy.html","url":"legal/de/privacy.html","paths":["legal/de/privacy","legal/de/privacy.html"]},{"kind":"public","file":"legal/de/refunds.html","url":"legal/de/refunds.html","paths":["legal/de/refunds","legal/de/refunds.html"]},{"kind":"public","file":"legal/de/terms.html","url":"legal/de/terms.html","paths":["legal/de/terms","legal/de/terms.html"]},{"kind":"public","file":"legal/en/account-deletion.html","url":"legal/en/account-deletion.html","paths":["legal/en/account-deletion","legal/en/account-deletion.html"]},{"kind":"public","file":"legal/en/imprint.html","url":"legal/en/imprint.html","paths":["legal/en/imprint","legal/en/imprint.html"]},{"kind":"public","file":"legal/en/privacy.html","url":"legal/en/privacy.html","paths":["legal/en/privacy","legal/en/privacy.html"]},{"kind":"public","file":"legal/en/refunds.html","url":"legal/en/refunds.html","paths":["legal/en/refunds","legal/en/refunds.html"]},{"kind":"public","file":"legal/en/terms.html","url":"legal/en/terms.html","paths":["legal/en/terms","legal/en/terms.html"]},{"kind":"public","file":"legal/es/account-deletion.html","url":"legal/es/account-deletion.html","paths":["legal/es/account-deletion","legal/es/account-deletion.html"]},{"kind":"public","file":"legal/es/imprint.html","url":"legal/es/imprint.html","paths":["legal/es/imprint","legal/es/imprint.html"]},{"kind":"public","file":"legal/es/privacy.html","url":"legal/es/privacy.html","paths":["legal/es/privacy","legal/es/privacy.html"]},{"kind":"public","file":"legal/es/refunds.html","url":"legal/es/refunds.html","paths":["legal/es/refunds","legal/es/refunds.html"]},{"kind":"public","file":"legal/es/terms.html","url":"legal/es/terms.html","paths":["legal/es/terms","legal/es/terms.html"]},{"kind":"public","file":"legal/fr/account-deletion.html","url":"legal/fr/account-deletion.html","paths":["legal/fr/account-deletion","legal/fr/account-deletion.html"]},{"kind":"public","file":"legal/fr/imprint.html","url":"legal/fr/imprint.html","paths":["legal/fr/imprint","legal/fr/imprint.html"]},{"kind":"public","file":"legal/fr/privacy.html","url":"legal/fr/privacy.html","paths":["legal/fr/privacy","legal/fr/privacy.html"]},{"kind":"public","file":"legal/fr/refunds.html","url":"legal/fr/refunds.html","paths":["legal/fr/refunds","legal/fr/refunds.html"]},{"kind":"public","file":"legal/fr/terms.html","url":"legal/fr/terms.html","paths":["legal/fr/terms","legal/fr/terms.html"]},{"kind":"public","file":"legal/imprint.html","url":"legal/imprint.html","paths":["legal/imprint","legal/imprint.html"]},{"kind":"public","file":"legal/it/account-deletion.html","url":"legal/it/account-deletion.html","paths":["legal/it/account-deletion","legal/it/account-deletion.html"]},{"kind":"public","file":"legal/it/imprint.html","url":"legal/it/imprint.html","paths":["legal/it/imprint","legal/it/imprint.html"]},{"kind":"public","file":"legal/it/privacy.html","url":"legal/it/privacy.html","paths":["legal/it/privacy","legal/it/privacy.html"]},{"kind":"public","file":"legal/it/refunds.html","url":"legal/it/refunds.html","paths":["legal/it/refunds","legal/it/refunds.html"]},{"kind":"public","file":"legal/it/terms.html","url":"legal/it/terms.html","paths":["legal/it/terms","legal/it/terms.html"]},{"kind":"public","file":"legal/privacy.html","url":"legal/privacy.html","paths":["legal/privacy","legal/privacy.html","privacy","privacy.html","privacy/","privacy/index.html"]},{"kind":"public","file":"legal/refunds.html","url":"legal/refunds.html","paths":["legal/refunds","legal/refunds.html"]},{"kind":"public","file":"legal/terms.html","url":"legal/terms.html","paths":["legal/terms","legal/terms.html","terms","terms.html","terms/","terms/index.html"]},{"kind":"public","file":"legal/tr/account-deletion.html","url":"legal/tr/account-deletion.html","paths":["legal/tr/account-deletion","legal/tr/account-deletion.html"]},{"kind":"public","file":"legal/tr/imprint.html","url":"legal/tr/imprint.html","paths":["legal/tr/imprint","legal/tr/imprint.html"]},{"kind":"public","file":"legal/tr/privacy.html","url":"legal/tr/privacy.html","paths":["legal/tr/privacy","legal/tr/privacy.html"]},{"kind":"public","file":"legal/tr/refunds.html","url":"legal/tr/refunds.html","paths":["legal/tr/refunds","legal/tr/refunds.html"]},{"kind":"public","file":"legal/tr/terms.html","url":"legal/tr/terms.html","paths":["legal/tr/terms","legal/tr/terms.html"]},{"kind":"public","file":"support.html","url":"support.html","paths":["support","support.html","support/"]},{"kind":"landing","file":"tr/index.html","url":"tr/","paths":["tr","tr/","tr/index.html"]},{"kind":"public","file":"tr/delete-account/index.html","url":"tr/delete-account/","paths":["tr/delete-account","tr/delete-account/","tr/delete-account/index.html"]},{"kind":"public","file":"tr/privacy/index.html","url":"tr/privacy/","paths":["tr/privacy","tr/privacy/","tr/privacy/index.html"]},{"kind":"public","file":"tr/support/index.html","url":"tr/support/","paths":["tr/support","tr/support/","tr/support/index.html"]},{"kind":"public","file":"tr/terms/index.html","url":"tr/terms/","paths":["tr/terms","tr/terms/","tr/terms/index.html"]}]};
const SHELL_CACHE = `${CACHE_PREFIX}${BUILD.version}`;
const MEDIA_CACHE = `${SHELL_CACHE}:media`;
const ASSET_CACHE = `${SHELL_CACHE}:assets`;
const BUILD_KEY = new URL('__oda_build', BASE).href;
const INSTALL_KEY = new URL('__oda_install', BASE).href;
const installationKey = reservation => `${INSTALL_KEY}/${encodeURIComponent(reservation.owner)}`;
const isInstallationKey = key => key === INSTALL_KEY || key.startsWith(`${INSTALL_KEY}/`);
const INSTALL_LEASE_MS = 15 * 60 * 1000;
const BUILT_ASSETS = new Set(BUILD.assets.map(file => new URL(file, BASE).href));
const DOCUMENTS = new Map((BUILD.documents || []).flatMap(document => document.paths.map(path => [path, document])));
const ASSET_LIMITS = { entries: 160, bytes: 24 * 1024 * 1024 };
const MEDIA_LIMITS = { entries: 48, bytes: 48 * 1024 * 1024 };
const INDEX_URL = new URL(BASE.pathname === '/' ? 'app' : 'index.html', BASE).href;
const LANDING_URL = new URL('', BASE).href;
const SHELL = ['', 'index.html', 'support.html', 'theme-init.js', 'intro.js', 'intro.css', 'startup-fallback.js', 'public-entry.js', 'manifest.webmanifest', 'manifest-tr.webmanifest', 'manifest-es.webmanifest', 'manifest-fr.webmanifest', 'manifest-de.webmanifest', 'manifest-it.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-192-maskable.png', 'icon-512-maskable.png', 'apple-touch-icon.png', 'brand/domino8/oda-mark-domino8-v1-256.png', 'brand/domino8/oda-app-domino8-v1-192.png', 'brand/domino8/oda-app-domino8-v1-512.png', 'brand/domino8/oda-app-domino8-v1-maskable-192.png', 'brand/domino8/oda-app-domino8-v1-maskable-512.png', 'brand/domino8/oda-apple-domino8-v1-180.png', 'brand/domino8/oda-favicon-domino8-v1-32.png'].map(path => new URL(BASE.pathname === '/' ? ({ 'index.html': 'app', 'support.html': 'support' }[path] || path) : path, BASE).href);
const REQUIRED = new Set([...SHELL, ...(BUILD.documents || []).map(document => new URL(document.url, BASE).href),
  ...(BUILD.precache || BUILD.assets).map(file => new URL(file, BASE).href)]);
const mediaAsset = url => /\.(?:png|jpe?g|webp|svg|ico|mp4|webm)$/i.test(url.pathname);

const inScope = url => url.origin === BASE.origin && url.pathname.startsWith(BASE.pathname);
const publicResponse = response => response.status === 200 && !response.redirected
  && !response.headers.has('set-cookie') && !/\b(?:private|no-store)\b/i.test(response.headers.get('cache-control') || '')
  // A credential-varying response cannot be shared across device accounts.
  && !(response.headers.get('vary') || '').split(',').some(value => ['*', 'cookie', 'authorization'].includes(value.trim().toLowerCase()));
const manifestRequest = url => inScope(url) && !url.search
  && /^manifest(?:-(?:tr|es|fr|de|it))?\.webmanifest$/.test(url.pathname.slice(BASE.pathname.length));
const codeAsset = url => inScope(url) && !url.search && !url.hash
  && /^assets\/.*\.(?:js|css|json|woff2?)$/.test(url.pathname.slice(BASE.pathname.length))
  && !url.pathname.startsWith(`${BASE.pathname}assets/oda/narration/`);
function canonicalAsset(url) {
  if (url.hash) return;
  if (!url.search) return url;
  const retry = url.searchParams.get('oda_retry');
  if (url.searchParams.size !== 1 || !/^[1-9]\d*$/.test(retry || '') || !Number.isSafeInteger(Number(retry))) return;
  const canonical = new URL(url.href);
  canonical.search = '';
  if (!codeAsset(canonical) || !/\.(?:js|css)$/.test(canonical.pathname)) return;
  // Membership is checked by the reader or writer. A live old document may
  // retry a public chunk that belongs only to a retained predecessor.
  return canonical;
}

// Asset caches are optional. A quota or privacy-mode failure must not reject
// a successful download or make an already saved personal record inaccessible.
const cacheWrites = new Map();
async function boundedPut(cache, name, key, response, limits) {
  const previous = cacheWrites.get(name) || Promise.resolve();
  const write = previous.catch(() => {}).then(async () => {
    // Measure actual body bytes; missing or inaccurate Content-Length cannot bypass the budget.
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > limits.bytes) return false;
    const headers = new Headers(response.headers);
    headers.set('x-oda-cache-bytes', String(bytes.byteLength));
    const stored = new Response(bytes, { status: response.status, statusText: response.statusText, headers });
    const rows = [];
    for (const request of await cache.keys()) {
      const hit = await cache.match(request);
      const recorded = hit?.headers.get('x-oda-cache-bytes');
      const size = recorded == null ? NaN : Number(recorded);
      rows.push({ request, bytes: Number.isFinite(size) && size >= 0 ? size : (await hit?.arrayBuffer())?.byteLength || 0 });
    }
    const url = typeof key === 'string' ? key : key.url;
    let count = rows.length + (rows.some(row => row.request.url === url) ? 0 : 1);
    let total = rows.filter(row => row.request.url !== url).reduce((sum, row) => sum + row.bytes, bytes.byteLength);
    // A rejected optional write must leave the previous offline set intact.
    // Prune only after CacheStorage has accepted the replacement.
    await cache.put(key, stored);
    for (const row of rows) {
      if (count <= limits.entries && total <= limits.bytes) break;
      if (row.request.url === url) continue;
      await cache.delete(row.request); count--; total -= row.bytes;
    }
    return true;
  });
  cacheWrites.set(name, write);
  try { return await write; } finally { if (cacheWrites.get(name) === write) cacheWrites.delete(name); }
}
async function optionalCache(name, limits) {
  let cache;
  try { cache = await caches.open(name); } catch { /* Continue with the network. */ }
  return {
    match: async key => { try { return await cache?.match(key); } catch { return undefined; } },
    put: async (key, response) => { try { if (cache) { if (limits) return await boundedPut(cache, name, key, response, limits); await cache.put(key, response); return true; } } catch { /* Keep the fetched response usable. */ } return false; },
  };
}

// Ownership is captured before opening this installation's cache. Hashes do
// not imply age: a later installation can open its cache before we activate.
let edition;
let installation;
const clientBuilds = new Map();
let maintenance = Promise.resolve();
const editionName = name => name.startsWith(CACHE_PREFIX) && /^[\w-]+$/.test(name.slice(CACHE_PREFIX.length));
async function readEdition(name) {
  try {
    const keys = await caches.keys();
    if (!keys.includes(name)) return;
    const response = await (await caches.open(name)).match(BUILD_KEY);
    if (!response) return;
    const record = await response.json();
    if (record.version !== name.slice(CACHE_PREFIX.length) || !Array.isArray(record.assets)
      || !record.assets.every(file => typeof file === 'string' && codeAsset(new URL(file, BASE)))
      || !Array.isArray(record.previous) || !record.previous.every(editionName)) return;
    return record;
  } catch { return; }
}
async function currentEdition() { return edition ||= await readEdition(SHELL_CACHE); }
const ownershipIdentity = record => record && JSON.stringify([record.version, record.generation, record.owner, record.phase, record.startedAt]);
const ownershipHeaders = responses => JSON.stringify(responses.map(response => response && response.headers.get('x-oda-ownership')));
async function ownershipResponses(cache) {
  if (!cache) return [undefined, undefined];
  const markers = (await cache.keys()).map(request => request.url).filter(key => key !== INSTALL_KEY && isInstallationKey(key)).sort();
  return Promise.all([BUILD_KEY, INSTALL_KEY, ...markers].map(key => cache.match(key)));
}
async function cacheOwnership(cache) {
  const responses = await ownershipResponses(cache);
  const records = await Promise.all(responses.map(response => response?.json()));
  return { identity: JSON.stringify(records.map(ownershipIdentity)), headers: ownershipHeaders(responses) };
}
async function saveEdition(cache, record) {
  await cache.put(BUILD_KEY, new Response(JSON.stringify(record),
    { headers: { 'Content-Type': 'application/json', 'x-oda-ownership': ownershipIdentity(record) } }));
}
async function releaseInstallation(cache, reservation, key = installationKey(reservation)) {
  const response = await cache.match(key);
  if (!response) return;
  const current = await response.json();
  // Each installer owns a distinct key. A stale body read or pending delete
  // can release only that owner; deployed shared markers remain recoverable.
  if (current.version === reservation.version && current.owner === reservation.owner
    && current.generation === reservation.generation && current.startedAt === reservation.startedAt) await cache.delete(key);
}
function installerOwns(worker, reservation) {
  if (typeof MessageChannel === 'undefined' || typeof worker?.postMessage !== 'function') return Promise.resolve(undefined);
  return new Promise(resolve => {
    const channel = new MessageChannel();
    const finish = owns => { clearTimeout(timer); channel.port1.close(); channel.port2.close(); resolve(owns); };
    const timer = setTimeout(() => finish(undefined), 250);
    channel.port1.onmessage = event => finish((reservation.owner === undefined || event.data?.owner === reservation.owner)
      && event.data?.version === reservation.version && event.data?.generation === reservation.generation);
    try { worker.postMessage({ type: 'ODA_INSTALL_OWNER' }, [channel.port2]); } catch { finish(undefined); }
  });
}
async function installationProtected(name, generation, ownershipChecks = new Map()) {
  try {
    if (!(await caches.keys()).includes(name)) return false;
    const cache = await caches.open(name);
    const registrationKnown = 'installing' in self.registration && 'waiting' in self.registration;
    const slots = [self.registration.installing, self.registration.waiting].filter(worker => worker && worker.state !== 'redundant');
    const owns = (identity, key, allowUnknown = false) => {
      if (!ownershipChecks.has(key)) ownershipChecks.set(key, Promise.all(slots.map(worker => installerOwns(worker, identity))));
      return ownershipChecks.get(key).then(matches => matches.some(match => match === true || allowUnknown && match === undefined));
    };
    const markers = (await cache.keys()).filter(request => isInstallationKey(request.url));
    for (const request of markers) {
      const response = await cache.match(request);
      if (!response) continue;
      const reservation = await response.json();
      const age = Date.now() - reservation.startedAt;
      const leased = reservation.version === name.slice(CACHE_PREFIX.length)
        && typeof reservation.owner === 'string' && reservation.owner.length > 0
        && Number.isSafeInteger(reservation.generation) && reservation.generation > generation
        && Number.isFinite(reservation.startedAt) && age >= 0 && age < INSTALL_LEASE_MS;
      // A newer activation supersedes earlier installers. A bounded lease also
      // recovers an interrupted rollback whose old ownership stays active.
      if (leased && (!registrationKnown || slots.length)) return true;
      // A live owner can outlast the recovery lease. Worker URLs are shared by
      // builds, so ask the registration slots for the exact reservation owner.
      if (reservation.owner && reservation.generation > generation && await owns(reservation, reservation.owner)) return true;
      // Old deployed workers wrote version-only markers. Keep one only while
      // the registration can still be installing; completed waiting builds
      // are protected by their newer ownership below.
      if (!reservation.owner && reservation.version === name.slice(CACHE_PREFIX.length)
        && self.registration.installing && self.registration.installing.state !== 'redundant') return true;
      await releaseInstallation(cache, reservation, request.url);
    }
    // A replacement may reserve the same shell while an orphan's response or
    // deletion is pending. Recheck keys before authorizing any retirement.
    if ((await cache.keys()).some(request => isInstallationKey(request.url))) return true;
    // A reused name can now belong to an installed or active successor. The
    // predecessor's in-memory ownership list must not retire that newer owner.
    const record = await readEdition(name);
    if (record?.phase === 'installing' || !(record?.generation > generation)) return false;
    // A crash after publishing installed metadata still has no waiting owner.
    // Confirm the build and generation when the registration is observable.
    // Older deployed waiting workers do not answer the new ownership protocol.
    // Retain unknown live slots, while an empty registration proves an orphan.
    if (record.phase === 'installed' && registrationKnown) return await owns(record, `edition:${name}:${record.generation}:${record.owner || ''}`, true);
    return true;
  } catch { return true; /* Unreadable ownership must retain its source. */ }
}
async function retirePreviousCache(name, key, request, generation, ownershipChecks) {
  // CacheStorage has no compare-and-delete operation. Fence the destructive
  // call with fresh ownership, then repair any overlap from the detached Cache
  // object and snapshot. Existing handles remain usable after name deletion.
  const keys = await caches.keys();
  if (!keys.includes(key)) return;
  const owner = keys.includes(name) ? await caches.open(name) : undefined;
  const before = await cacheOwnership(owner);
  if (await installationProtected(name, generation, ownershipChecks)) return;
  const cache = await caches.open(key), snapshot = new Map();
  for (const entry of request ? [request] : await cache.keys()) {
    const response = await cache.match(entry);
    if (response) snapshot.set(entry.url, response);
  }
  const attachedKeys = await caches.keys();
  if (attachedKeys.includes(name) !== !!owner) return;
  const attachedOwner = owner && await caches.open(name);
  // These are newly matched responses, obtained after every awaited guard and
  // snapshot read. Headers expose generation/owner without awaiting a body
  // captured before a newer installation published or reserved the name.
  const fresh = await ownershipResponses(attachedOwner);
  if (ownershipHeaders(fresh) !== before.headers) return;
  if (request) await cache.delete(request);
  else await caches.delete(key);
  let changed;
  try {
    changed = (await cacheOwnership(attachedOwner)).identity !== before.identity;
    const afterKeys = await caches.keys();
    if (afterKeys.includes(name)) changed ||= (await cacheOwnership(await caches.open(name))).identity !== before.identity;
    else changed ||= !!owner && key !== name;
  } catch { changed = true; /* Restore when post-delete ownership is unreadable. */ }
  if (!changed) return;
  // Include writes made while delete was pending. Do not resurrect a released
  // reservation or overwrite entries a newer attached installer has supplied.
  if (!request) {
    snapshot.delete(BUILD_KEY);
    for (const url of snapshot.keys()) if (isInstallationKey(url)) snapshot.delete(url);
    for (const entry of await cache.keys()) {
      const response = await cache.match(entry);
      if (response) snapshot.set(entry.url, response);
    }
  }
  const restored = await caches.open(key);
  for (const [url, response] of snapshot) {
    const current = await restored.match(url);
    let replace = !current;
    if (current && (url === BUILD_KEY || isInstallationKey(url))) {
      replace = (await response.clone().json()).generation > (await current.json()).generation;
    }
    if (replace) await restored.put(url, response.clone());
  }
}
async function previousAsset(url, clientId) {
  const record = await currentEdition();
  if (!record || !codeAsset(url)) return;
  const currentAsset = BUILT_ASSETS.has(url.href);
  const owner = clientBuilds.get(clientId);
  let keys;
  try { keys = await caches.keys(); } catch { return; }
  const sources = [...new Set([...record.previous, ...(owner ? [`${CACHE_PREFIX}${owner}`] : [])])];
  for (const name of sources) {
    if (!currentAsset && owner && name !== `${CACHE_PREFIX}${owner}`) continue;
    const previous = await readEdition(name);
    if (previous && !previous.assets.some(file => new URL(file, BASE).href === url.href)) continue;
    // Editions predating ownership metadata can supply only exact cached public
    // code URLs. APIs, queries and credential-varying responses still bypass us.
    for (const key of [name, `${name}:assets`].filter(key => keys.includes(key))) {
      const hit = await (await optionalCache(key)).match(url.href);
      if (hit && publicResponse(hit)) return hit;
    }
  }
}
async function maintainPrevious() {
  const record = await currentEdition();
  if (!record || record.phase !== 'active') return;
  const ownershipChecks = new Map();
  const protectedInstallation = name => installationProtected(name, record.generation, ownershipChecks);
  const windows = (await self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
    .filter(client => inScope(new URL(client.url)));
  const keys = await caches.keys();
  // Later can replace the waiting slot repeatedly without activating us again.
  // These editions were never in the active worker's install-time predecessors.
  const deferred = keys.filter(name => editionName(name) && name !== SHELL_CACHE && !record.previous.includes(name));
  // Keep one complete predecessor throughout this active edition. A navigation
  // started under the old controller can finish after any client snapshot.
  const keep = new Set(record.previous.slice(0, 1));
  for (const client of windows) {
    // Inventoried static pages have no build-specific imports to retain. Their
    // offline documents stay in our shell even after worker memory is reset.
    if (DOCUMENTS.get(new URL(client.url).pathname.slice(BASE.pathname.length))?.kind === 'public') continue;
    const owner = clientBuilds.get(client.id);
    if (!owner) {
      [...record.previous, ...deferred].forEach(name => keep.add(name));
      try { client.postMessage({ type: 'ODA_CLIENT_BUILD_REQUEST' }); } catch { /* Keep unacknowledged builds. */ }
    }
    else keep.add(`${CACHE_PREFIX}${owner}`);
  }
  for (const name of deferred.filter(name => !keep.has(name))) {
    const waiting = await readEdition(name);
    if (!waiting || !['installing', 'installed'].includes(waiting.phase) || !(waiting.generation > record.generation)
      || await protectedInstallation(name)) continue;
    for (const key of [name, `${name}:assets`, `${name}:media`]) {
      await retirePreviousCache(name, key, undefined, record.generation, ownershipChecks);
    }
  }
  const current = await optionalCache(ASSET_CACHE, ASSET_LIMITS);
  const shell = await optionalCache(SHELL_CACHE);
  const sources = [];
  for (const name of record.previous) {
    if (await protectedInstallation(name)) continue;
    for (const key of [name, `${name}:assets`].filter(key => keys.includes(key))) {
      const cache = await caches.open(key);
      sources.push({ name, key, cache, requests: await cache.keys() });
    }
  }
  // Copy first, then recheck the final bounded cache. A later successful copy
  // may evict an earlier one, and a rejected write must retain its source.
  for (const source of sources) for (const request of source.requests) {
    const url = new URL(request.url);
    if (!codeAsset(url) || !BUILT_ASSETS.has(url.href) || REQUIRED.has(url.href) || await current.match(url.href)) continue;
    const response = await source.cache.match(request);
    if (response && publicResponse(response)) await current.put(url.href, response);
  }
  const retained = new Set();
  for (const source of sources.filter(source => keep.has(source.name))) for (const request of source.requests) {
    const response = BUILT_ASSETS.has(request.url) && await source.cache.match(request);
    if (response && publicResponse(response)) retained.add(request.url);
  }
  for (const name of record.previous.filter(name => !keep.has(name))) {
    if (await protectedInstallation(name)) continue;
    let fallback = false;
    for (const source of sources.filter(source => source.name === name)) {
      let saved = false;
      for (const request of source.requests) {
        if (request.url === BUILD_KEY || isInstallationKey(request.url)) continue;
        const url = new URL(request.url);
        const needed = codeAsset(url) && BUILT_ASSETS.has(url.href) && !retained.has(url.href)
          && !await shell.match(url.href) && !await current.match(url.href);
        const response = needed && await source.cache.match(request);
        if (response && publicResponse(response)) { retained.add(url.href); saved = fallback = true; }
        else await retirePreviousCache(name, source.key, request, record.generation, ownershipChecks);
      }
      if (!saved && source.key !== name) await retirePreviousCache(name, source.key, undefined, record.generation, ownershipChecks);
    }
    if (!fallback && keys.includes(name)) await retirePreviousCache(name, name, undefined, record.generation, ownershipChecks);
    if (keys.includes(`${name}:media`)) await retirePreviousCache(name, `${name}:media`, undefined, record.generation, ownershipChecks);
  }
}
function scheduleMaintenance() {
  maintenance = maintenance.catch(() => {}).then(maintainPrevious).catch(() => {});
  return maintenance;
}

async function shellFetch(request, options) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      fetch(request, { ...options, signal: controller.signal }).then(async response => {
        if (!response.body || response.status === 0 || response.redirected) return response;
        const body = await response.arrayBuffer();
        return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
      }),
      new Promise((_, reject) => { timer = setTimeout(() => { reject(new Error('Shell request timed out')); controller.abort(); }, 8000); }),
    ]);
  } finally { clearTimeout(timer); }
}

async function forEachLimited(files, action, concurrency = 4) {
  let next = 0, failure;
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, async () => {
    while (next < files.length && !failure) {
      const file = files[next++];
      try { await action(file); } catch (error) { failure = error; }
    }
  }));
  if (failure) throw failure;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const createdShell = !keys.includes(SHELL_CACHE);
    const names = [...new Set(keys.map(key => key.replace(/:(?:assets|media)$/, ''))
      .filter(name => editionName(name) && name !== SHELL_CACHE))];
    const previous = await Promise.all(names.map(async (name, index) => ({ name, order: (await readEdition(name))?.generation || index + 1 })));
    edition = { version: BUILD.version, assets: BUILD.assets, phase: 'installing',
      generation: Math.max(0, ...previous.map(item => item.order)) + 1,
      previous: previous.sort((a, b) => b.order - a.order).map(item => item.name) };
    const cache = await caches.open(SHELL_CACHE);
    const reservation = { version: BUILD.version, generation: edition.generation, startedAt: Date.now(),
      owner: `${edition.generation}:${Math.random().toString(36).slice(2)}` };
    edition.owner = reservation.owner;
    installation = reservation;
    const retained = new Map();
    let metadataWritten = false, retainedReady = false;
    const reserve = cache => cache.put(installationKey(reservation), new Response(JSON.stringify(reservation),
      { headers: { 'Content-Type': 'application/json', 'x-oda-ownership': ownershipIdentity(reservation) } }));
    try {
      // An identical rollback can reuse a retained shell. Its bytes and
      // ownership must survive until this installation completes.
      await reserve(cache);
      if (!createdShell) for (const request of await cache.keys()) {
        if (isInstallationKey(request.url)) continue;
        const response = await cache.match(request);
        if (response) retained.set(request.url, response);
      }
      retainedReady = true;
      if (createdShell) await saveEdition(cache, edition);
      const downloaded = new Map();
      await forEachLimited([...REQUIRED], async url => {
        const request = new Request(url, { cache: 'reload', credentials: 'omit' });
        const response = await shellFetch(request);
        if (!publicResponse(response)) throw new Error('Offline installation requires a complete public asset');
        downloaded.set(url, response);
      });
      edition.phase = 'installed';
      // CacheStorage.delete detaches a name without invalidating existing Cache
      // objects. Reopen the name, repair missing shell entries from validated
      // downloads, and verify a fresh handle before accepting installation.
      for (let attempt = 0; attempt < 2; attempt++) {
        const attached = await caches.open(SHELL_CACHE);
        await reserve(attached);
        for (const url of REQUIRED) {
          const hit = await attached.match(url);
          if ((createdShell && attempt === 0) || !hit || !publicResponse(hit)) await attached.put(url, downloaded.get(url).clone());
        }
        for (const [url, response] of retained) {
          if (url !== BUILD_KEY && publicResponse(response) && !await attached.match(url)) await attached.put(url, response.clone());
        }
        await saveEdition(attached, edition);
        metadataWritten = true;
        const verified = await caches.open(SHELL_CACHE);
        let complete = true;
        for (const url of REQUIRED) {
          const hit = await verified.match(url);
          if (!hit || !publicResponse(hit)) { complete = false; break; }
        }
        const owner = complete && await readEdition(SHELL_CACHE);
        if (complete && owner?.generation === edition.generation && owner.phase === 'installed') return;
      }
      throw new Error('Offline installation requires a complete attached shell');
    } catch (error) {
      if (createdShell) await caches.delete(SHELL_CACHE);
      else if (retainedReady) {
        const original = await caches.open(SHELL_CACHE);
        for (const [url, response] of retained) {
          if ((url === BUILD_KEY && metadataWritten) || !await original.match(url)) await original.put(url, response.clone());
        }
        for (const request of await original.keys()) {
          if (!isInstallationKey(request.url) && !retained.has(request.url)) await original.delete(request);
        }
      }
      throw error;
    } finally {
      // Do not recreate the incomplete name after a failed new installation.
      if ((await caches.keys()).includes(SHELL_CACHE)) await releaseInstallation(await caches.open(SHELL_CACHE), reservation);
      if (installation === reservation) installation = undefined;
    }
  })());
});

// Only an explicit action in an ODA window can activate a waiting edition.
// Other open tabs may still contain unfinished work and old lazy imports.
self.addEventListener('message', event => {
  if (event.data?.type === 'ODA_INSTALL_OWNER') {
    let sourceUrl;
    try { sourceUrl = new URL(event.source?.scriptURL); } catch { return; }
    if (!inScope(sourceUrl) || !event.ports?.[0]) return;
    const port = event.ports[0];
    event.waitUntil((async () => {
      try {
        const record = installation || await currentEdition();
        port.postMessage({ version: BUILD.version, generation: record?.generation, owner: record?.owner });
      } finally { port.close(); }
    })());
    return;
  }
  if (event.source?.type !== 'window') return;
  let sourceUrl;
  try { sourceUrl = new URL(event.source.url); } catch { return; }
  if (!inScope(sourceUrl)) return;
  if (['ODA_REMINDER_STATE', 'ODA_REMINDER_CLAIM', 'ODA_REMINDER_RELEASE'].includes(event.data?.type)) { handleReminderMessage(event); return; }
  if (event.data?.type === 'ODA_CLIENT_BUILD') {
    event.waitUntil((async () => {
      const record = await currentEdition();
      const version = event.data.version;
      if (record && event.source.id && typeof version === 'string'
        && editionName(`${CACHE_PREFIX}${version}`)
        && (version === BUILD.version || record.previous.includes(`${CACHE_PREFIX}${version}`) || await readEdition(`${CACHE_PREFIX}${version}`))) {
        clientBuilds.set(event.source.id, version);
        await scheduleMaintenance();
      }
    })());
    return;
  }
  if (event.data?.type === 'ODA_CACHE_VISITED_ASSETS' && Array.isArray(event.data.assets)) {
    // First-load requests can finish before this worker takes control. Only
    // public files in this exact build may fill that on-demand cache gap.
    event.waitUntil((async () => {
      const cache = await optionalCache(ASSET_CACHE, ASSET_LIMITS);
      const shell = await optionalCache(SHELL_CACHE);
      const files = new Set(event.data.assets.filter(file => typeof file === 'string' && file.length < 2048));
      await forEachLimited([...files], async file => {
        try {
          const url = new URL(file, BASE), canonical = canonicalAsset(url);
          if (!inScope(url) || !canonical || !BUILT_ASSETS.has(canonical.href)) return;
          const request = new Request(url, { credentials: 'omit' });
          if (await shell.match(canonical.href) || await cache.match(canonical.href)) return;
          const response = await shellFetch(request);
          if (publicResponse(response)) await cache.put(canonical.href, response);
        } catch { /* A visited asset can retry on its next normal request. */ }
      });
    })());
    return;
  }
  if (event.data?.type !== 'ODA_ACTIVATE_UPDATE') return;
  event.waitUntil((async () => {
    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (clients.filter(client => inScope(new URL(client.url))).length > 1) {
        event.source.postMessage({ type: 'ODA_UPDATE_BLOCKED' });
        return;
      }
      await self.skipWaiting();
    } catch { event.source.postMessage({ type: 'ODA_UPDATE_FAILED' }); }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const record = await currentEdition();
    if (record) {
      record.phase = 'active';
      try { await saveEdition(await caches.open(SHELL_CACHE), record); } catch { /* Retention remains conservative. */ }
      await installationProtected(SHELL_CACHE, record.generation);
    }
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients.filter(client => inScope(new URL(client.url)))) {
      try { client.postMessage({ type: 'ODA_CLIENT_BUILD_REQUEST' }); } catch { /* Unacknowledged clients retain their editions. */ }
    }
    await scheduleMaintenance();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // CacheStorage is shared by accounts on this device. Authenticated requests,
  // APIs and query data stay with the network, apart from the public JS retry.
  if (!inScope(url) || request.headers?.has('authorization') || request.cache === 'no-store') return;
  const relativePath = url.pathname.slice(BASE.pathname.length);
  const entryDocument = relativePath === '' || relativePath === 'index.html';
  const document = DOCUMENTS.get(relativePath);
  // A controlled browser must still reach the host's real 404 for invalid IDs.
  // The unbuilt development worker retains its legacy navigation contract.
  const validMemberRoute = !BUILD.routes || BUILD.routes.includes(relativePath);
  const appDocument = document?.kind === 'member' || (!BUILD.documents && ((/^app(?:\/|$)/.test(relativePath)
    && (BASE.pathname !== '/' || validMemberRoute)) || (BASE.pathname !== '/' && entryDocument)));
  const landingDocument = BASE.pathname === '/' && entryDocument && (!BUILD.documents || document?.kind === 'landing');
  const publicDocument = document && document.kind !== 'member' || (!BUILD.documents && (/^(?:(?:en|tr|es|fr|de|it)\/)?(?:privacy|terms|support|account-deletion)(?:\/|\/index\.html)?$/.test(relativePath)
    || /^(?:privacy|terms|support)\.html$/.test(relativePath)
    || /^(?:en|tr|es|fr|de|it)\/(?:index\.html)?$/.test(relativePath)));

  // Hash routes use the entry document. Inventoried history routes receive
  // their offline document; unknown IDs keep the host's missing-page behavior.
  if (request.mode === 'navigate' && (appDocument || landingDocument || (publicDocument && !url.search))) {
    event.respondWith((async () => {
      const cache = await optionalCache(SHELL_CACHE);
      // Public documents have separate canonical keys. Member callback query
      // data never becomes part of a stored document URL.
      const publicUrl = new URL(url.href);
      if (BASE.pathname === '/') {
        publicUrl.pathname = publicUrl.pathname.replace(/\/index\.html$/, '/').replace(/^\/(support|privacy|terms)(?:\.html|\/)?$/, '/$1');
      }
      const documentUrl = document ? new URL(document.url, BASE).href : appDocument ? INDEX_URL : landingDocument ? LANDING_URL : publicUrl.href;
      const hydrated = appDocument || landingDocument || document?.kind === 'landing';
      if (document?.kind === 'public' && new URL('.', url).href !== new URL('.', new URL(document.file, BASE)).href) {
        // A static document's relative rights/account links require its real
        // directory, including when this alias is opened without a network.
        return Response.redirect(documentUrl, 302);
      }
      const serveOwned = response => {
        // Standalone public pages need no registration script to identify the
        // document just served. Never replace the navigating source client's ID.
        if (response && document && event.resultingClientId && publicResponse(response)) {
          clientBuilds.set(event.resultingClientId, BUILD.version);
        }
        return response;
      };
      // A deployed HTML document must use the scripts installed with this worker.
      // The browser installs a newer complete edition in the background.
      if (hydrated && BUILD.assets.length) {
        const installed = await cache.match(documentUrl);
        if (installed) return serveOwned(installed);
      }
      try {
        // Fetch a public document without member cookies or callback query data.
        const response = await shellFetch(new Request(documentUrl, { credentials: 'omit' }));
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          const belongs = !hydrated || !BUILD.assets.length
            || (await response.clone().text()).includes(`<meta name="oda-pwa-build" content="${BUILD.version}">`);
          if (publicResponse(response) && belongs) {
            await cache.put(documentUrl, response.clone());
          }
          return belongs ? serveOwned(response) : response;
        }
        return serveOwned(await cache.match(documentUrl)) || response;
      } catch {
        return serveOwned(await cache.match(documentUrl)) || Response.error();
      }
    })());
    return;
  }

  // Installed app metadata must refresh even when a previous shell is cached.
  if (manifestRequest(url)) {
    event.respondWith((async () => {
      const cache = await optionalCache(SHELL_CACHE);
      try {
        const response = await shellFetch(request, { cache: 'no-cache', credentials: 'omit' });
        if (response.ok) { if (publicResponse(response)) await cache.put(request, response.clone()); return response; }
        return (await cache.match(request)) || response;
      } catch { return (await cache.match(request)) || Response.error(); }
    })());
    return;
  }

  // The narration adapter owns its bounded, checksum-verified on-demand cache.
  const narrationAsset = inScope(url) && url.pathname.startsWith(`${BASE.pathname}assets/oda/narration/`);
  const canonical = canonicalAsset(url);
  const builtAsset = canonical && BUILT_ASSETS.has(canonical.href);
  const publicAsset = /^assets\/oda\/.*\.(?:woff2?|png|jpe?g|webp|svg|ico|mp4|webm)$/i.test(relativePath)
    || (!BUILD.assets.length && /^assets\/.*\.(?:js|css)$/i.test(relativePath))
    || /^brand\/.*\.(?:png|webp|svg|ico)$/i.test(relativePath);
  const oldAsset = canonical && !builtAsset && !publicAsset && codeAsset(canonical) && BUILD.assets.length
    && /-[\w-]{8,}\.(?:js|css|json|woff2?)$/.test(canonical.pathname);
  if (canonical && !narrationAsset && (builtAsset || publicAsset || SHELL.includes(url.href) || oldAsset)) {
    event.respondWith((async () => {
      if (request.headers?.has('range')) return fetch(request);
      if (oldAsset) {
        // An unlisted code URL stays an untouched network request unless an
        // owned previous edition contains that exact public response.
        return (await previousAsset(canonical, event.clientId)) || fetch(request);
      }
      const shell = await optionalCache(SHELL_CACHE);
      const installed = await shell.match(canonical.href);
      if (installed) return installed;
      const isMedia = mediaAsset(url);
      const cache = await optionalCache(isMedia ? MEDIA_CACHE : ASSET_CACHE, isMedia ? MEDIA_LIMITS : ASSET_LIMITS);
      const hit = await cache.match(canonical.href);
      if (hit) return hit;
      const previous = await previousAsset(canonical, event.clientId);
      if (previous) return previous;
      const response = await fetch(request, { credentials: 'omit' });
      if (publicResponse(response)) {
        const target = REQUIRED.has(canonical.href) ? shell : cache;
        event.waitUntil(target.put(canonical.href, response.clone()).catch(() => {}));
      }
      return response;
    })());
    return;
  }

});

// Private scheduling metadata has a separate cache and never enters the public shell.
const REMINDER_CACHE = `oda-reminders:${encodeURIComponent(BASE.pathname)}:v1`;
const REMINDER_KEY = new URL('__reminder_state', BASE).href;
let reminderQueue = Promise.resolve();
const serialReminder = work => {
  const next = reminderQueue.catch(() => undefined).then(work);
  reminderQueue = next;
  return next;
};
async function reminderState() {
  const cache = await caches.open(REMINDER_CACHE);
  const response = await cache.match(REMINDER_KEY);
  return response ? response.json() : { owner: '', enabled: false, deliveries: [] };
}
async function saveReminderState(state) {
  const cache = await caches.open(REMINDER_CACHE);
  await cache.put(REMINDER_KEY, new Response(JSON.stringify(state), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } }));
}
function reminderDay(at, timezone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(at));
}
function reminderQuiet(state, at) {
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: state.timezone || 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(at));
  const { start = '22:00', end = '08:00' } = state.quietHours || {};
  return start !== end && (start < end ? time >= start && time < end : time >= start || time < end);
}
function reminderAllowed(state, owner, id, at) {
  if (!state.enabled || !owner || state.owner !== owner || reminderQuiet(state, at)) return false;
  const day = reminderDay(at, state.timezone);
  const elapsed = state.deliveries || [];
  return !elapsed.some(row => row.id === id) && elapsed.filter(row => reminderDay(row.at, state.timezone) === day).length < state.cap;
}
function handleReminderMessage(event) {
  event.waitUntil(serialReminder(async () => {
    const data = event.data, state = await reminderState();
    if (data.type === 'ODA_REMINDER_STATE') {
      const changed = state.owner !== data.owner;
      const deliveries = changed ? [] : state.deliveries || [];
      for (const row of data.deliveries || []) if (typeof row.id === 'string' && Number.isFinite(Date.parse(row.at)) && !deliveries.some(item => item.id === row.id)) deliveries.push({ id: row.id, at: row.at, ...(row.engaged === true ? { engaged: true } : {}) });
      let timezone = data.timezone || 'UTC';
      try { reminderDay(Date.now(), timezone); } catch { timezone = 'UTC'; }
      Object.assign(state, { owner: typeof data.owner === 'string' ? data.owner : '', enabled: data.enabled === true, timezone,
        quietHours: data.quietHours, cap: [2, 3, 6].includes(data.cap) ? data.cap : 2,
        deliveries: deliveries.filter(row => Date.parse(row.at) > Date.now() - 32 * 86400000).slice(-192) });
      await saveReminderState(state);
      if (changed || !state.enabled) for (const notification of await self.registration.getNotifications()) notification.close();
      event.ports?.[0]?.postMessage({ deliveries: state.deliveries });
    } else if (data.type === 'ODA_REMINDER_CLAIM') {
      const at = new Date().toISOString();
      const accepted = typeof data.id === 'string' && reminderAllowed(state, data.owner, data.id, at);
      if (accepted) { state.deliveries.push({ id: data.id, at }); await saveReminderState(state); }
      event.ports?.[0]?.postMessage({ accepted });
    } else {
      if (state.owner === data.owner) { state.deliveries = state.deliveries.filter(row => row.id !== data.id); await saveReminderState(state); }
      event.ports?.[0]?.postMessage({ released: true });
    }
  }).catch(() => event.ports?.[0]?.postMessage({ accepted: false })));
}

self.addEventListener('push', event => {
  // The browser invokes this event even when no ODA tab is open.
  // A deployed VAPID sender and an opted-in subscription are still required.
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { /* Use a visible safe default. */ }
  const title = typeof payload.title === 'string' ? payload.title.slice(0, 120) : 'ODA';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 2000) : 'Yeni sözün hazır. Bugün kendine küçük bir alan aç.';
  const display = () => self.registration.showNotification(title, {
    body,
    icon: new URL('brand/domino8/oda-app-domino8-v1-192.png', BASE).href,
    badge: new URL('brand/domino8/oda-app-domino8-v1-192.png', BASE).href,
    tag: typeof payload.tag === 'string' ? payload.tag.slice(0, 120) : 'oda-daily-inspiration',
    data: { url: typeof payload.url === 'string' ? payload.url : '/app', deliveryId: payload.deliveryId, owner: payload.owner },
  });
  if (!payload.owner || !payload.deliveryId) { event.waitUntil(display()); return; }
  event.waitUntil(serialReminder(async () => {
    const state = await reminderState(), now = Date.now();
    if (!reminderAllowed(state, payload.owner, payload.deliveryId, now) || !Number.isFinite(Date.parse(payload.dueAt))
      || now < Date.parse(payload.dueAt) || now - Date.parse(payload.dueAt) > 90 * 60000) return;
    // A durable claim precedes display; failed display releases it for a retry.
    state.deliveries.push({ id: payload.deliveryId, at: new Date(now).toISOString() });
    await saveReminderState(state);
    try { await display(); } catch (error) { state.deliveries = state.deliveries.filter(row => row.id !== payload.deliveryId); await saveReminderState(state); throw error; }
  }).catch(() => undefined));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const notificationOwner = event.notification.data?.owner, delivery = event.notification.data?.deliveryId;
  if (notificationOwner && delivery) event.waitUntil(serialReminder(async () => { const state = await reminderState(); if (state.owner !== notificationOwner) return; const row = state.deliveries.find(item => item.id === delivery); if (row) { row.engaged = true; await saveReminderState(state); } }).catch(() => undefined));
  const defaultTarget = new URL(BASE.pathname === '/' ? 'app' : '#/app', BASE);
  const requested = event.notification.data?.url;
  let target = defaultTarget;
  if (typeof requested === 'string') {
    try {
      // Also handle notifications created by older versions before the base
      // path fix, which stored the canonical /app route directly.
      const candidate = BASE.pathname !== '/' && requested.startsWith('/app')
        ? new URL(`#${requested}`, BASE)
        : new URL(requested, BASE);
      if (inScope(candidate)) target = candidate;
    } catch { /* Keep the deployment-local home route. */ }
  }
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
    const client = clients.find(item => inScope(new URL(item.url)));
    if (client) {
      if ('navigate' in client) await client.navigate(target.href);
      return client.focus();
    }
    return self.clients.openWindow(target.href);
  }));
});
