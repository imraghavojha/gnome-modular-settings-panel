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
        this._modules = {};
        this._moduleConnections = [];
    }

    enable() {
        this._stylesheet = Me.path + '/stylesheet.css';

        this._settings.connect('changed::show-indicator', this._updateModules.bind(this));
        this._updateModules();


        if (!Main.getThemeStylesheet().includes(this._stylesheet)) {
            Main.getThemeManager()._addStylesheet(this._stylesheet);
        }
    }

    disable() {
        this._unloadModules();
        this._settings = null;
        this._moduleConnections.forEach(c => this._settings.disconnect(c));
        this._moduleConnections = [];

        if (Main.getThemeStylesheet().includes(this._stylesheet)) {
            Main.getThemeManager()._removeStylesheet(this._stylesheet);
        }
    }

    _updateModules() {
        if (this._settings.get_boolean('show-indicator')) {
            this._loadModules();
        } else {
            this._unloadModules();
        }
    }

    _loadModules() {
        const modulesDir = Me.dir.get_child('modules');
        const files = modulesDir.enumerate_children(
            'standard::name', Gio.FileQueryInfoFlags.NONE, null);

        let file;
        while ((file = files.next_file(null)) !== null) {
            const name = file.get_name().replace('.js', '');
            if (this._settings.get_boolean(`${name}-enabled`)) {
                if (!this._modules[name]) {
                    const module = Me.imports.modules[name];
                    const toggle = new module[Object.keys(module)[0]](this._settings);
                    this._modules[name] = toggle;
                    Main.panel.addToStatusArea(`${this._uuid}-${name}`, toggle);
                }
            }

            const connectionId = this._settings.connect(`changed::${name}-enabled`, () => {
                if (this._settings.get_boolean('show-indicator') && this._settings.get_boolean(`${name}-enabled`)) {
                    if (!this._modules[name]) {
                        const moduleFile = modulesDir.get_child(`${name}.js`);
                        if (moduleFile.query_exists(null)) {
                            const module = Me.imports.modules[name];
                            const toggle = new module[Object.keys(module)[0]](this._settings);
                            this._modules[name] = toggle;
                            Main.panel.addToStatusArea(`${this._uuid}-${name}`, toggle);
                        }
                    }
                } else {
                    if (this._modules[name]) {
                        this._modules[name].destroy();
                        delete this._modules[name];
                    }
                }
            });
            this._moduleConnections.push(connectionId);
        }
    }

    _unloadModules() {
        for (const name in this._modules) {
            this._modules[name].destroy();
        }
        this._modules = {};
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
