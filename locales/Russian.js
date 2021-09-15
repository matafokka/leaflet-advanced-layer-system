/**
 * Russian locale
 * @type {function}
 */
L.ALS.Locales.AdditionalLocales.Russian = function() { L.ALS.Locales["Русский"] = {
	language: "ru",
	region: "ru",

	// Menu buttons tooltips

	menuCloseButton: "Закрыть меню",
	menuNewProjectButton: "Новый проект",
	menuSaveButton: "Сохранить проект",
	menuSaveAsButton: "Сохранить проект как...",
	menuLoadButton: "Загрузить проект",
	menuExportButton: "Экспортировать проект",
	menuUndoButton: "Отменить",
	menuRedoButton: "Повторить",
	menuSettingsButton: "Настройки",
	menuMapButton: "Сервис карт",
	menuZoomInButton: "Увеличить масштаб",
	menuZoomOutButton: "Уменьшить масштаб",
	menuAddButton: "Добавить новый слой",

	// Sidebar window

	sidebarWindowCancelButton: "Отмена",

	// Wizard

	wizardSelectTitle: "Тип нового слоя",
	wizardContentTitle: "Параметры нового слоя",
	wizardAddButton: "Добавить",

	// Settings

	settingsSelectTitle: "Разделы настроек",
	settingsContentTitle: "Настройки для выбранного раздела",
	settingsApplyButton: "Применить и Закрыть",
	settingsExportButton: "Экспорт Настроек",
	settingsImportButton: "Импорт Настроек",
	settingsRevertButton: "Вернуть к изначальному значению",
	settingsLoadingNotSupported: "Извините, ваш браузер не поддерживает загрузку файлов. Пожалуйста, установите современный браузер, чтобы этого не происходило.",
	settingsImportError: "Файл, который вы пытаетесь загрузить, не является файлом настроек",
	settingsSavingNotSupported: "Настройки не сохранятся при перезагрузке страницы, поскольку ваш браузер это не поддерживает. Пожалуйста, установите современный браузер, чтобы этого не происходило.",
	settingsAboutItem: "О программе",

	// General settings

	settingsGeneralSettings: "Общие настройки",
	generalSettingsLanguage: "Язык:",
	generalSettingsTheme: "Тема:",
	generalSettingsLightTheme: "Светлая",
	generalSettingsDarkTheme: "Темная",
	generalSettingsSystemTheme: "Системная",
	generalSettingsMenuPosition: "Положение меню:",
	generalSettingsMenuLeft: "Слева",
	generalSettingsMenuRight: "Справа",
	generalSettingsNotify: "Уведомлять о завершении длительных операций (снятие выделения с этой галочки убирает надоедливое окно, говорящее: \"Все операции завершены\")",

	// System

	systemNewFileTabTitle: "Новый проект",
	systemProjectAlreadyOpen: "У вас уже открыт проект. Если вы откроете другой проект, изменения в текущем проекте не будут сохранены. Вы уверены, что хотите открыть другой проект?",
	systemProjectLoadingNotSupported: "Извините, ваш браузер не поддерживает загрузку проектов. Однако, вы можете создать новый проект, сохранить его и позже открыть в более современном браузере.",
	systemConfirmDeletion: "Вы уверены, что хотите удалить этот слой?",
	systemNotProject: "Файл, который вы пытаетесь загрузить, не является файлом проекта",
	systemProjectSaved: "Проект сохранен",
	systemBeforeNewProject: "Ваш проект может содержать несохраненные изменения. Вы уверены, что хотите создать новый проект?",
	systemBeforeExit: "Ваш проект может содержать несохраненные изменения. Хотите ли вы остаться и сохранить проект?",
	systemBeforeExitStay: "Остаться",
	systemBeforeExitExit: "Выйти Без Сохранения",

	// Warnings displayed when file download is not supported

	// For IE9
	systemDownloadNotSupportedIE: "Пожалуйста, загрузите все файлы",
	systemDownloadNotSupportedExtensionIE: "и вручную измените их расширения на",

	// For other browsers
	systemDownloadNotSupported: "Пожалуйста, вручную сохраните текст из всех вкладок, которые сейчас откроются,",
	systemDownloadNotSupportedNoExtension: "после того, как вы закроете это окно",
	systemDownloadNotSupportedExtension1: "в", // ".extension"
	systemDownloadNotSupportedExtension2: "файлы",

	// If needed to change extension manually
	systemDownloadNotSupportedChangeExtensionManually: "Пожалуйста, вручную измените расширения загруженного файла на",

	// Common line
	systemDownloadNotSupportedCommon: "Извините за неудобства. Пожалуйста, обновите браузер, чтобы это не повторилось.\n\nЗагрузка начнется, как только вы закроете это окно.",

	// Window that will be displayed in IE when user will try to load project.
	systemIEAdjustSettings1: "Извините, чтобы открыть проект, нужно либо открыть эту страницу через нормальный браузер, либо изменить настройки вашего текущего браузера. Чтобы изменить настройки:",
	systemIEAdjustSettings2: "В верхнем левом углу окна вашего браузера находится иконка в виде шестеренеки. Нажмите на нее и выберите \"Свойства обозревателя\".",
	systemIEAdjustSettings3: "В открывшемся окне откройте вкладку \"Безопасность\".",
	systemIEAdjustSettings4: "Нажмите на кнопку \"Другой...\".",
	systemIEAdjustSettings5: "В открывшемся окне измените следующие две опции:",
	systemIEAdjustSettings6: "Найдите \"Выполнять сценарии ActiveX, не помеченные как безопасные\" и установите \"Предлагать\".",
	systemIEAdjustSettings7: "Найдите \"Включать путь к локальному каталогу при отправке файлов на сервер\" и установите \"Включить\".",
	systemIEAdjustSettings8: "Нажмите \"ОК\" в обоих окнах и перезагрузите страницу.",
	systemIEAdjustSettingsOkButton: "ОК",

	// Notification when all long-running operations are complete
	systemOperationsComplete: "Все операции завершены",

	// Layer

	layerWizardName: "Слой",
	layerDefaultName: "Абстрактный Слой",

	// File widget

	fileNoFilesSelected: "Никакие файлы не выбраны. Нажмите сюда, чтобы выбрать файлы.",
	fileSelectedFile: "Выбранные файлы:",
}};