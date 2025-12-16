'use strict';

const { St, Gio } = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        this._settings = ExtensionUtils.getSettings(
            'org.gnome.shell.extensions.modular-settings-panel');
        this._modules = [];
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
        this._modules = [];
    }

    _showIndicator() {
        if (!this._indicator) {
            this._indicator = new St.BoxLayout({
                style_class: 'panel-button',
            });

            this._loadModules();

            Main.panel.addToStatusArea(this._uuid, this._indicator);
        }
    }

    _hideIndicator() {
        if (this._indicator) {
            this._unloadModules();
            this._indicator.destroy();
            this._indicator = null;
        }
    }

    _loadModules() {
        const modulesDir = Me.dir.get_child('modules');
        const files = modulesDir.enumerate_children(
            'standard::name', Gio.FileQueryInfoFlags.NONE, null);

        let file;
        while ((file = files.next_file(null)) !== null) {
            const name = file.get_name().replace('.js', '');
            const module = Me.imports.modules[name];
            const toggle = new module[Object.keys(module)[0]](this._settings);
            this._modules.push(toggle);
            this._indicator.add_child(toggle);
        }
    }

    _unloadModules() {
        for (const module of this._modules) {
            module.destroy();
        }
        this._modules = [];
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
