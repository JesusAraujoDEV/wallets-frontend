# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1576 nodes · 4589 edges · 150 communities (82 shown, 68 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `55b015a0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- rates.ts
- kiro-guard-code-quality.js
- Account
- button.tsx
- TransactionsCalendar.tsx
- budgets.ts
- sidebar.tsx
- Login.tsx
- MobileSidebarHeader.tsx
- card.tsx
- useToast
- CategoryMultiSelect.tsx
- AccountsStore
- use-toast.ts
- cn
- debts.ts
- CategoryGroups.tsx
- DashboardChartsGrid.tsx
- Transaction
- utils.ts
- useDashboardCharts.ts
- Category
- apiFetch
- types.ts
- Statistics.tsx
- CategoryEditorDialog.tsx
- CategoriesStore
- PayNowModal.tsx
- alert-dialog.tsx
- storage.ts
- CalendarView.tsx
- compilerOptions
- SubscriptionCreateDialog.tsx
- components.json
- DebtPayDialog.tsx
- TransactionsList.tsx
- subscriptions.ts
- metrics.js
- compilerOptions
- stats.ts
- types.ts
- chart.tsx
- dropdown-menu.tsx
- CalendarDialogs.tsx
- SubscriptionCard.tsx
- dependencies
- Debts.tsx
- Subscriptions.tsx
- compilerOptions
- carousel.tsx
- SingleTransactionForm.tsx
- types.ts
- onDataChange
- useStatisticsComparison.ts
- menubar.tsx
- toast.tsx
- devDependencies
- compilerOptions
- DebtSummaryCard.tsx
- form.tsx
- App.tsx
- IncomeHeatmap.tsx
- Debt
- context-menu.tsx
- BudgetCard.tsx
- scripts
- ProfileInfoCard.tsx
- drawer.tsx
- navigation-menu.tsx
- package.json
- DebtCard.tsx
- DebtCardInfo.tsx
- toggle-group.tsx
- use-transactions-query.ts
- AccountCard.tsx
- LanguageSwitcher.tsx
- useLinkableTransactions.ts
- bcryptjs
- class-variance-authority
- cmdk
- date-fns
- dayjs
- embla-carousel-react
- @emotion/react
- @emotion/styled
- eslint
- autoprefixer
- eslint-plugin-react-hooks
- globals
- @hookform/resolvers
- i18next
- i18next-browser-languagedetector
- input-otp
- jose
- lovable-tagger
- lucide-react
- @mui/material
- @mui/x-date-pickers
- next-themes
- @radix-ui/react-accordion
- @radix-ui/react-alert-dialog
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-context-menu
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-hover-card
- @radix-ui/react-label
- @radix-ui/react-menubar
- @radix-ui/react-navigation-menu
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-toggle
- @radix-ui/react-toggle-group
- @radix-ui/react-tooltip
- react-day-picker
- react-dom
- react-hook-form
- react-i18next
- @react-oauth/google
- react-resizable-panels
- react-router-dom
- recharts
- sonner
- tailwind-merge
- tailwindcss-animate
- vaul
- zod
- postcss
- @tailwindcss/typography
- @types/node
- @types/react
- @types/react-dom
- typescript
- typescript-eslint
- @vitejs/plugin-react-swc

## God Nodes (most connected - your core abstractions)
1. `cn()` - 97 edges
2. `useToast()` - 66 edges
3. `Button` - 63 edges
4. `Account` - 62 edges
5. `Category` - 56 edges
6. `Debt` - 47 edges
7. `Card` - 45 edges
8. `Label` - 44 edges
9. `Transaction` - 41 edges
10. `apiFetch()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `useCarousel()` --references--> `react`  [EXTRACTED]
  src/components/ui/carousel.tsx → package.json
- `useChart()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `useFormField()` --references--> `react`  [EXTRACTED]
  src/components/ui/form.tsx → package.json
- `useSidebar()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json
- `useIsMobile()` --references--> `react`  [EXTRACTED]
  src/hooks/use-mobile.tsx → package.json

## Import Cycles
- None detected.

## Communities (150 total, 68 thin omitted)

### Community 0 - "rates.ts"
Cohesion: 0.06
Nodes (55): CurrencyToggle(), LABEL_KEYS, DashboardStats(), DashboardStatsProps, normalizeType(), toUsd(), EmptyDashboardState(), SidebarRateIndicator() (+47 more)

### Community 1 - "kiro-guard-code-quality.js"
Cohesion: 0.07
Nodes (43): { configFor }, { dirname }, { violation, isExempt, findRoot }, {
  WRITE_TOOLS,
  filePath,
  readHookInput,
  respond,
  resultingContent,
  toolName,
}, { configFor }, { existsSync, readFileSync }, {
  WRITE_TOOLS,
  filePath,
  readHookInput,
  respond,
  resultingContent,
  toolName,
}, { configFor } (+35 more)

### Community 2 - "Account"
Cohesion: 0.19
Nodes (17): AccountSelectorProps, ALL_ACCOUNT, AccountSelectFieldProps, TransactionFiltersProps, Input, Label, labelVariants, RadioGroup (+9 more)

### Community 3 - "button.tsx"
Cohesion: 0.20
Nodes (15): CategoryIcon(), iconMap, ConfirmPaymentFooterProps, ONBOARDING_STEPS, OnboardingStep, Button, DialogContent, DialogDescription (+7 more)

### Community 4 - "TransactionsCalendar.tsx"
Cohesion: 0.11
Nodes (23): CalendarDayTooltip(), CalendarDayTooltipProps, CalendarGrid(), CalendarGridProps, WEEKDAY_KEYS, CalendarHeader(), CalendarHeaderProps, CalendarModeScopeTabs() (+15 more)

### Community 5 - "budgets.ts"
Cohesion: 0.11
Nodes (28): ApiBudget, ApiBudgetCategory, ApiBudgetResponse, ApiBudgetStatus, createBudget(), fetchBudgets(), fetchBudgetsStatus(), mapBudget() (+20 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.07
Nodes (29): Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent (+21 more)

### Community 7 - "Login.tsx"
Cohesion: 0.16
Nodes (21): getReadableError(), parseBackendMessage(), persistSession(), setToken(), AuthSession, isValidEmail(), sanitizeEmailInput(), sanitizeNameInput() (+13 more)

### Community 8 - "MobileSidebarHeader.tsx"
Cohesion: 0.12
Nodes (22): LanguageSwitcher(), DesktopSidebar(), MobileSidebarHeader(), buildNavigationItems(), SidebarNav(), NavigationItem, SidebarLayout(), OnboardingTour() (+14 more)

### Community 9 - "card.tsx"
Cohesion: 0.20
Nodes (13): KPICardProps, Badge(), BadgeProps, badgeVariants, Card, CardContent, CardDescription, CardFooter (+5 more)

### Community 10 - "useToast"
Cohesion: 0.16
Nodes (21): useLinkTransactionsSave(), RequireAuth(), useToast(), AuthApi, deleteBudget(), useDeleteBudget(), ForgotPassword(), ChangePasswordDialog() (+13 more)

### Community 11 - "CategoryMultiSelect.tsx"
Cohesion: 0.13
Nodes (17): Props, CategorySelector(), PaymentDateFieldProps, Checkbox, Command, CommandDialogProps, CommandEmpty, CommandGroup (+9 more)

### Community 12 - "AccountsStore"
Cohesion: 0.20
Nodes (17): AccountGrid(), AccountGridProps, AccountManager(), createAccount(), saveMetadataOnly(), saveWithBalanceAdjustment(), DeleteAccountDialog(), useAccountDelete() (+9 more)

### Community 13 - "use-toast.ts"
Cohesion: 0.13
Nodes (21): TransferForm(), useBcvTransferRate(), useTransferArbitrage(), useTransferForm(), getTransferValidationError(), Action, ActionType, actionTypes (+13 more)

### Community 14 - "cn"
Cohesion: 0.12
Nodes (22): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator(), ButtonProps (+14 more)

### Community 15 - "debts.ts"
Cohesion: 0.13
Nodes (23): ApiDebt, ApiDebtResponse, ApiTransaction, createDebt(), deleteDebt(), linkTransactions(), mapApiTransaction(), mapDebt() (+15 more)

### Community 16 - "CategoryGroups.tsx"
Cohesion: 0.16
Nodes (18): assignCategoriesToGroup(), createCategoryGroup(), deleteCategoryGroup(), updateCategoryGroup(), CategoryGroup, CategoryGroupUpsertPayload, AssignCategoriesDialog(), DeleteGroupDialog() (+10 more)

### Community 17 - "DashboardChartsGrid.tsx"
Cohesion: 0.11
Nodes (16): BudgetComparisonChart(), ExpenseData, ExpensePieChart(), ExpensePieChartProps, ExpenseVolatilityBoxPlot(), ExpenseVolatilityBoxPlotProps, IncomeVolatilityBoxPlot(), IncomeVolatilityBoxPlotProps (+8 more)

### Community 18 - "Transaction"
Cohesion: 0.19
Nodes (18): AccountSelectField(), AmountCurrencyFields(), AmountCurrencyFieldsProps, ConfirmPaymentFooter(), PaymentDateField(), PaymentSummaryCard(), PaymentSummaryCardProps, calculateConvertedAmount() (+10 more)

### Community 19 - "utils.ts"
Cohesion: 0.09
Nodes (16): AccordionContent, AccordionItem, AccordionTrigger, HoverCardContent, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot (+8 more)

### Community 20 - "useDashboardCharts.ts"
Cohesion: 0.17
Nodes (19): BudgetComparisonChartProps, BudgetData, fetchExpenseVolatility(), fetchIncomeHeatmap(), fetchIncomeVolatility(), fetchMonthlyForecast(), fetchNetCashFlow(), fetchSpendingHeatmap() (+11 more)

### Community 21 - "Category"
Cohesion: 0.16
Nodes (15): CategoryListItem(), CategoryListItemProps, CategoryListSectionProps, Props, CategorySelectorProps, DebtAmountCurrencyFields(), DebtContactFields(), DebtFormDialogFooter() (+7 more)

### Community 22 - "apiFetch"
Cohesion: 0.20
Nodes (17): ExportFormat, useTransactionExport(), exportAllTransactions(), exportTransactionsFromData(), exportTransfers(), exportTransfersEpicPdf(), exportTransfersEpicPdfAuto(), TransactionsExportFilters (+9 more)

### Community 23 - "types.ts"
Cohesion: 0.15
Nodes (19): AuthSessionResponse, AuthProfileResponse, AuthUser, BudgetCategorySummary, CategoryGroupAnalyticsBehavior, CategoryGroupType, ChangePasswordPayload, ChangePasswordResponse (+11 more)

### Community 24 - "Statistics.tsx"
Cohesion: 0.22
Nodes (15): ComparativeMoM(), ComparativeMoMProps, ComparativeMoMIncome(), ComparativeMoMIncomeProps, Table, TableBody, TableCaption, TableCell (+7 more)

### Community 25 - "CategoryEditorDialog.tsx"
Cohesion: 0.18
Nodes (13): CategoryBasicFields(), CategoryColorPicker(), CategoryEditorDialog(), CategoryEditorDialogFooter(), CategoryIconPicker(), CategoryEditorDialogProps, CategoryEditorValue, presetColors (+5 more)

### Community 26 - "CategoriesStore"
Cohesion: 0.22
Nodes (13): CategoryListSection(), CategoryManager(), DeleteCategoryDialog(), useCategoryDelete(), useCategoryFormDialog(), useCategoryManagerData(), useCategoryUpsertMutation(), CategoryFormModal() (+5 more)

### Community 27 - "PayNowModal.tsx"
Cohesion: 0.21
Nodes (14): PayNowAccountSelector(), PayNowAmountCurrencyFields(), PayNowDateField(), PayNowModal(), PayNowModalFooter(), PayNowSubscriptionCard(), Currency, PayNowModalProps (+6 more)

### Community 28 - "alert-dialog.tsx"
Cohesion: 0.39
Nodes (11): DeleteAccountDialogProps, DeleteCategoryDialogProps, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader() (+3 more)

### Community 29 - "storage.ts"
Cohesion: 0.13
Nodes (16): GlobalLoadingBar(), accountsCache, ApiCategory, ApiCategoryGroup, bus, categoriesCache, emitNet(), fetchJSON() (+8 more)

### Community 30 - "CalendarView.tsx"
Cohesion: 0.20
Nodes (13): fetchPendingTransactions(), fetchRecurringTransactions(), CalendarGrid(), WEEKDAY_KEYS, DayDashboard(), PendingApprovalsSection(), buildEvents(), CalendarEvent (+5 more)

### Community 31 - "compilerOptions"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 32 - "SubscriptionCreateDialog.tsx"
Cohesion: 0.20
Nodes (13): SubscriptionAmountCurrencyFields(), SubscriptionCategoryAccountFields(), SubscriptionCreateDialog(), SubscriptionCreateDialogFooter(), SubscriptionDebtLinkField(), SubscriptionDescriptionTypeFields(), SubscriptionScheduleFields(), CreateSubscriptionForm (+5 more)

### Community 33 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 34 - "DebtPayDialog.tsx"
Cohesion: 0.18
Nodes (11): computeDebtPaymentDerived(), DebtAccountSelector(), DebtAmountField(), DebtCategoryDateFields(), DebtEquivalentAmountField(), DebtPayDialogFooter(), DebtPaymentPreview(), resolveSelectedAccount() (+3 more)

### Community 35 - "TransactionsList.tsx"
Cohesion: 0.22
Nodes (12): TransactionFilters(), TransactionExportDialog(), DailyTotal, useDailyTotals(), useGroupedTransactions(), useTransactionEditForm(), useTransactionFiltersState(), TransactionsDeleteConfirm() (+4 more)

### Community 36 - "subscriptions.ts"
Cohesion: 0.21
Nodes (15): ApiRecurringResponse, ApiRecurringTransaction, createRecurringTransaction(), deleteRecurringTransaction(), mapRecurringTransaction(), triggerRecurringTransactions(), unwrapRecurring(), updateRecurringTransaction() (+7 more)

### Community 37 - "metrics.js"
Cohesion: 0.14
Nodes (12): analyze(), args, csv, devs, exec, { execSync }, files, git() (+4 more)

### Community 38 - "compilerOptions"
Cohesion: 0.12
Nodes (15): DOM, DOM.Iterable, ES2020, compilerOptions, isolatedModules, jsx, lib, module (+7 more)

### Community 39 - "stats.ts"
Cohesion: 0.15
Nodes (14): ComparativeMoMIncomeResponse, ComparativeMoMResponse, ComparativePeriodParams, ExpenseVolatilityCategory, ExpenseVolatilityResponse, IncomeHeatmapResponse, IncomeVolatilityCategory, IncomeVolatilityResponse (+6 more)

### Community 40 - "types.ts"
Cohesion: 0.23
Nodes (10): OtpBoxesInput(), OtpBoxesInputProps, EMPTY_OTP, OtpDigits, ProfileEditFormValues, useEmailChangeActions(), useEmailChangeDialog(), useEmailChangeDialogState() (+2 more)

### Community 41 - "chart.tsx"
Cohesion: 0.13
Nodes (12): react, react, useCarousel(), ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent (+4 more)

### Community 42 - "dropdown-menu.tsx"
Cohesion: 0.17
Nodes (12): DebtCardActions(), DebtCardActionsProps, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator (+4 more)

### Community 43 - "CalendarDialogs.tsx"
Cohesion: 0.23
Nodes (11): DebtFormValues, DEBTS_QUERY_KEY, payDebt(), payNowRecurringTransaction(), PENDING_TRANSACTIONS_QUERY_KEY, RECURRING_TRANSACTIONS_QUERY_KEY, PayNowRecurringPayload, CalendarDialogs() (+3 more)

### Community 44 - "SubscriptionCard.tsx"
Cohesion: 0.28
Nodes (8): TransferArbitrageSummary(), Alert, AlertDescription, AlertTitle, alertVariants, Switch, SubscriptionCard(), modeLabelKey()

### Community 45 - "dependencies"
Cohesion: 0.15
Nodes (14): clsx, framer-motion, dependencies, clsx, framer-motion, @radix-ui/react-aspect-ratio, @radix-ui/react-slider, @radix-ui/react-tabs (+6 more)

### Community 46 - "Debts.tsx"
Cohesion: 0.25
Nodes (8): AccountSelector(), LinkTransactionsDialog(), TransactionForm(), TabsContent, TabsList, TabsTrigger, DebtGridSection(), DeleteDebtDialog()

### Community 47 - "Subscriptions.tsx"
Cohesion: 0.23
Nodes (11): CreateSubscriptionDialog(), DeleteSubscriptionDialog(), EditSubscriptionDialog(), PendingPaymentsSection(), Subscriptions(), SubscriptionsListSection(), CreateSubscriptionForm, DEFAULT_SUBSCRIPTION_FORM_VALUES (+3 more)

### Community 48 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, allowJs, baseUrl, noImplicitAny, noUnusedLocals, noUnusedParameters, paths, skipLibCheck (+5 more)

### Community 49 - "carousel.tsx"
Cohesion: 0.15
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 50 - "SingleTransactionForm.tsx"
Cohesion: 0.27
Nodes (7): DatePickerField(), useCalendarTheme(), SingleTransactionForm(), useSingleTransactionForm(), MONTH_KEYS, MonthYearSelect(), MonthValue

### Community 51 - "types.ts"
Cohesion: 0.26
Nodes (9): resolveAutoExchangeRate(), Currency, DebtPayDialogProps, fetchDirectRate(), getDirectExchangeRate(), AutoExchangeRateParams, useAutoExchangeRateEffect(), getRateByDate() (+1 more)

### Community 52 - "onDataChange"
Cohesion: 0.29
Nodes (7): useSubscriptionReferenceData(), fetchDebts(), onDataChange(), useCalendarReferenceData(), useDebtQueries(), useDebtsReferenceData(), useSubscriptionsReferenceData()

### Community 53 - "useStatisticsComparison.ts"
Cohesion: 0.27
Nodes (11): TransactionEditDialog(), fetchComparativeMoM(), fetchComparativeMoMIncome(), Statistics(), computeRangesForPreset(), EMPTY, firstOfMonth(), iso() (+3 more)

### Community 54 - "menubar.tsx"
Cohesion: 0.17
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 55 - "toast.tsx"
Cohesion: 0.24
Nodes (10): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+2 more)

### Community 56 - "devDependencies"
Cohesion: 0.18
Nodes (11): @eslint/js, eslint-plugin-react-refresh, devDependencies, @eslint/js, eslint-plugin-react-refresh, tailwindcss, vite, vite-plugin-pwa (+3 more)

### Community 57 - "compilerOptions"
Cohesion: 0.18
Nodes (10): api, compilerOptions, module, moduleResolution, skipLibCheck, strict, target, extends (+2 more)

### Community 58 - "DebtSummaryCard.tsx"
Cohesion: 0.27
Nodes (7): DebtSummaryCard(), formatCurrency(), useDebtPayConfirm(), DebtPaymentValidationError, DebtPaymentValidationOk, validateDebtPayment(), Progress

### Community 59 - "form.tsx"
Cohesion: 0.18
Nodes (9): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+1 more)

### Community 60 - "App.tsx"
Cohesion: 0.27
Nodes (5): queryClient, ThemeProvider(), Toaster(), ToasterProps, NotFound()

### Community 61 - "IncomeHeatmap.tsx"
Cohesion: 0.36
Nodes (6): IncomeHeatmap(), IncomeHeatmapProps, SpendingHeatmap(), SpendingHeatmapProps, TooltipContent, localizedWeekdays()

### Community 62 - "Debt"
Cohesion: 0.38
Nodes (7): TransactionRow(), TransactionRowProps, TransactionsList(), TransactionsListProps, fmtCurrency(), LinkTransactionsDialogProps, Debt

### Community 63 - "context-menu.tsx"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 64 - "BudgetCard.tsx"
Cohesion: 0.50
Nodes (7): BudgetCard(), formatMoney(), formatOriginalAmount(), periodBadgeLabel(), progressColorClass(), RATE_SOURCE_LABELS, rateSourceLabel()

### Community 65 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, db:migrate:tx-usd, dev, dev:ui, lint, preview

### Community 66 - "ProfileInfoCard.tsx"
Cohesion: 0.36
Nodes (5): Avatar, AvatarFallback, AvatarImage, ProfileEditForm(), ProfileField()

### Community 67 - "drawer.tsx"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 68 - "navigation-menu.tsx"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 69 - "package.json"
Cohesion: 0.29
Nodes (6): engines, node, name, private, type, version

### Community 70 - "DebtCard.tsx"
Cohesion: 0.48
Nodes (3): computeDebtProgress(), DebtCard(), DebtCardProps

### Community 71 - "DebtCardInfo.tsx"
Cohesion: 0.43
Nodes (4): DebtCardInfo(), DebtCardInfoProps, formatCurrency(), StatusBadge()

### Community 72 - "toggle-group.tsx"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 73 - "use-transactions-query.ts"
Cohesion: 0.48
Nodes (5): useTransactionsQuery(), UseTransactionsQueryArgs, buildTransactionsQuery(), mapServerTransaction(), TransactionFilters

### Community 74 - "AccountCard.tsx"
Cohesion: 0.50
Nodes (3): AccountCard(), AccountCardProps, CURRENCY_SYMBOLS

## Knowledge Gaps
- **415 isolated node(s):** `{ readFileSync, readdirSync, writeFileSync, existsSync, statSync }`, `{ execSync }`, `{ join, relative, dirname, sep }`, `args`, `csv` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **68 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `react-router-dom`, `recharts`, `sonner`, `tailwind-merge`, `tailwindcss-animate`, `vaul`, `zod`, `chart.tsx`, `package.json`, `bcryptjs`, `class-variance-authority`, `cmdk`, `date-fns`, `dayjs`, `embla-carousel-react`, `@emotion/react`, `@emotion/styled`, `@hookform/resolvers`, `i18next`, `i18next-browser-languagedetector`, `input-otp`, `jose`, `lucide-react`, `@mui/material`, `@mui/x-date-pickers`, `next-themes`, `@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-dom`, `react-hook-form`, `react-i18next`, `@react-oauth/google`, `react-resizable-panels`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Why does `react` connect `chart.tsx` to `useToast`, `dependencies`, `sidebar.tsx`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `budgets.ts`, `Login.tsx`, `card.tsx`, `use-toast.ts`, `debts.ts`, `Transaction`, `types.ts`, `PayNowModal.tsx`, `SubscriptionCreateDialog.tsx`, `subscriptions.ts`, `types.ts`, `chart.tsx`, `CalendarDialogs.tsx`, `Debts.tsx`, `Subscriptions.tsx`, `onDataChange`, `toast.tsx`, `DebtSummaryCard.tsx`, `useLinkableTransactions.ts`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **What connects `{ readFileSync, readdirSync, writeFileSync, existsSync, statSync }`, `{ execSync }`, `{ join, relative, dirname, sep }` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `rates.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06419753086419754 - nodes in this community are weakly interconnected._
- **Should `kiro-guard-code-quality.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07329462989840348 - nodes in this community are weakly interconnected._
- **Should `TransactionsCalendar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10960960960960961 - nodes in this community are weakly interconnected._