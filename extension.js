'use strict';

const { St, Gio } = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        this._settings = ExtensionUtils.getSettings(
            'org.gnome.shell.extensions.modular-settings-panel');
    }

    enable() {
        this._indicator = null;

        this._settings.connect('changed::show-indicator', () => {
            if (this._settings.get_boolean('show-indicator')) {
                this._showIndicator();
            } else {
                this._hideIndicator();
            }
        });

        if (this._settings.get_boolean('show-indicator')) {
            this._showIndicator();
        }
    }

    disable() {
        this._hideIndicator();
        this._settings = null;
    }

    _showIndicator() {
        if (!this._indicator) {
            this._indicator = new St.Bin({
                style_class: 'panel-button',
                reactive: true,
                can_focus: true,
                track_hover: true
            });

            let icon = new St.Icon({
                icon_name: 'system-run-symbolic',
                style_class: 'system-status-icon'
            });

            this._indicator.set_child(icon);
            this._indicator.connect('button-press-event', () => {
                Main.notify('Hello World!');
            });

            Main.panel.addToStatusArea(this._uuid, this._indicator);
        }
    }

    _hideIndicator() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
