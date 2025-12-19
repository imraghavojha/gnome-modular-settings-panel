'use strict';

const { GObject, St, Gio, Clutter, GLib } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

var QuickSettingsToggle = GObject.registerClass(
class QuickSettingsToggle extends PanelMenu.Button {
    _init(settings) {
        super._init(0.0, 'Quick Settings');

        // App specific settings from the modular extension
        this._appSettings = settings;

        // Settings
        this.interfaceSettings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.interface'
        });
        this.backgroundSettings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.background'
        });
        this.nightLightSettings = new Gio.Settings({
            schema_id: 'org.gnome.settings-daemon.plugins.color'
        });

        // Icon - moon
        this.icon = new St.Icon({
            icon_name: 'weather-clear-night-symbolic',
            style_class: 'system-status-icon'
        });
        this.add_child(this.icon);

        // Build menu
        this._buildMenu();

        // Update initial states
        this._updateDarkMode();
        this._updateNightLight();
        this._updateGrayscale();
    }

    _buildMenu() {
        // Dark Mode Toggle
        this.darkModeItem = new PopupMenu.PopupSwitchMenuItem('Dark Mode', false);
        this.darkModeItem.connect('toggled', this._onDarkModeToggled.bind(this));
        this.darkModeItem.activate = (event) => {
            this.darkModeItem.toggle();
            return true;
        };
        this.menu.addMenuItem(this.darkModeItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Night Light Toggle
        this.nightLightItem = new PopupMenu.PopupSwitchMenuItem('Night Light', false);
        this.nightLightItem.connect('toggled', this._onNightLightToggled.bind(this));
        this.nightLightItem.activate = (event) => {
            this.nightLightItem.toggle();
            return true;
        };
        this.menu.addMenuItem(this.nightLightItem);

        // Night Light Temperature Slider
        let sliderItem = new PopupMenu.PopupBaseMenuItem({ activate: false });
        let sliderBox = new St.BoxLayout({ vertical: false, style: 'spacing: 12px; padding: 0 12px;' });

        let warmthLabel = new St.Label({
            text: 'Warmth',
            y_align: Clutter.ActorAlign.CENTER,
            style: 'min-width: 80px;'
        });
        sliderBox.add_child(warmthLabel);

        this.tempSlider = new Slider.Slider(0);
        this.tempSlider.accessible_name = 'Night Light Temperature';
        this.tempSlider.connect('notify::value', this._onTempChanged.bind(this));
        this.tempSlider.style = 'min-width: 150px;';
        sliderBox.add_child(this.tempSlider);

        sliderItem.add_child(sliderBox);
        this.menu.addMenuItem(sliderItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Grayscale Toggle
        this.grayscaleItem = new PopupMenu.PopupSwitchMenuItem('Grayscale', false);
        this.grayscaleItem.connect('toggled', this._onGrayscaleToggled.bind(this));
        this.grayscaleItem.activate = (event) => {
            this.grayscaleItem.toggle();
            return true;
        };
        this.menu.addMenuItem(this.grayscaleItem);
    }

    _onDarkModeToggled(item, state) {
        const lightWallpaperPath = this._appSettings.get_string('light-wallpaper-path');
        const darkWallpaperPath = this._appSettings.get_string('dark-wallpaper-path');

        if (state) {
            this.interfaceSettings.set_string('color-scheme', 'prefer-dark');
            this.interfaceSettings.set_string('gtk-theme', 'Pop-dark');
            if (darkWallpaperPath) {
                this.backgroundSettings.set_string('picture-uri', 'file://' + darkWallpaperPath);
                this.backgroundSettings.set_string('picture-uri-dark', 'file://' + darkWallpaperPath);
            }
        } else {
            this.interfaceSettings.set_string('color-scheme', 'prefer-light');
            this.interfaceSettings.set_string('gtk-theme', 'Pop');
            if (lightWallpaperPath) {
                this.backgroundSettings.set_string('picture-uri', 'file://' + lightWallpaperPath);
                this.backgroundSettings.set_string('picture-uri-dark', 'file://' + lightWallpaperPath);
            }
        }
    }

    _onNightLightToggled(item, state) {
        this.nightLightSettings.set_boolean('night-light-enabled', state);
    }

    _onTempChanged() {
        let value = this.tempSlider.value;
        // Temperature range: 1700-4700 (cooler to warmer)
        let temp = Math.round(1700 + (value * 3000));
        this.nightLightSettings.set_uint('night-light-temperature', temp);
    }

    _onGrayscaleToggled(item, state) {
        try {
            if (state) {
                GLib.spawn_command_line_async('gsettings set org.gnome.desktop.a11y.interface high-contrast-enabled true');
            } else {
                GLib.spawn_command_line_async('gsettings set org.gnome.desktop.a11y.interface high-contrast-enabled false');
            }
        } catch (e) {
            log('Grayscale toggle error: ' + e);
        }
    }

    _updateDarkMode() {
        let colorScheme = this.interfaceSettings.get_string('color-scheme');
        let isDark = colorScheme === 'prefer-dark';
        this.darkModeItem.setToggleState(isDark);
    }

    _updateNightLight() {
        let enabled = this.nightLightSettings.get_boolean('night-light-enabled');
        this.nightLightItem.setToggleState(enabled);

        let temp = this.nightLightSettings.get_uint('night-light-temperature');
        let sliderValue = (temp - 1700) / 3000;
        this.tempSlider.value = sliderValue;
    }

    _updateGrayscale() {
        try {
            let result = GLib.spawn_command_line_sync('gsettings get org.gnome.desktop.a11y.interface high-contrast-enabled');
            let enabled = result[1].toString().trim() === 'true';
            this.grayscaleItem.setToggleState(enabled);
        } catch (e) {
            this.grayscaleItem.setToggleState(false);
        }
    }
});
