module.exports = `
<input type="file" class="als-file-hidden" id="als-load-input" />
<input type="file" class="als-file-hidden" id="als-load-settings-input" />
<div class="als-element als-border als-menu">
	<!-- Top panel -->
	<div class="als-items-row als-top-panel">
		
		<i class="ri ri-close-line als-menu-close"
		data-als-locale-property="menuCloseButton"
		data-als-locale-property-to-localize="title"></i>
		
		<i class="ri ri-file-line als-new-project-button"
		data-als-locale-property="menuNewProjectButton"
		data-als-locale-property-to-localize="title"></i>
		
		<i class="ri ri-save-3-line als-save-button"
		data-als-locale-property="menuSaveButton"
		data-als-locale-property-to-localize="title"></i>
		
		<i class="ri ri-file-copy-2-line als-save-as-button"
		data-als-locale-property="menuSaveAsButton"
		data-als-locale-property-to-localize="title"></i>
		
		<label for="als-load-input" class="ri ri-folder-open-line als-load-button"
		data-als-locale-property="menuLoadButton"
		data-als-locale-property-to-localize="title"></label>
		
		<i class="ri ri-share-line als-export-button"
		data-als-locale-property="menuExportButton"
		data-als-locale-property-to-localize="title"></i>
		
		<i class="ri ri-arrow-go-back-line als-undo-button"
		data-als-locale-property="menuUndoButton"
		data-als-locale-property-to-localize="title"></i>
		
		<i class="ri ri-arrow-go-forward-line als-redo-button"
		data-als-locale-property="menuRedoButton"
		data-als-locale-property-to-localize="title"></i>
		
		<i class="ri ri-sound-module-line als-settings-button"
		data-als-locale-property="menuSettingsButton"
		data-als-locale-property-to-localize="title"></i>
		
		<div class="ri ri-map-2-line als-menu-maps-select-wrapper"
		data-als-locale-property="menuMapButton"
		data-als-locale-property-to-localize="title">
			<select class="als-menu-maps-select"></select>
		</div>
		
		<i class="ri ri-zoom-out-line als-zoom-out-button"
		data-als-locale-property="menuZoomOutButton"
		data-als-locale-property-to-localize="title"></i>
		
		<i class="ri ri-zoom-in-line als-zoom-in-button"
		data-als-locale-property="menuZoomInButton"
		data-als-locale-property-to-localize="title"></i>
		
		<i class="ri ri-add-line als-menu-add"
		data-als-locale-property="menuAddButton"
		data-als-locale-property-to-localize="title"></i>
		
		<div class="als-top-panel-spacer">
			<div class="als-top-panel-spacer-text"></div>
		</div>
		
		<div class="als-electron-buttons-container">
			<i class="ri ri-subtract-line"></i>
			<i class="ri ri-checkbox-multiple-blank-line"></i>
			<i class="ri ri-close-line"></i>
		</div>
		
	</div>
	<!-- Content container -->
	<div class="als-menu-items"></div>
</div>
`