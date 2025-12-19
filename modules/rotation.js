'use strict';

const { GObject, St, Gio } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

var RotationToggle = GObject.registerClass(
class RotationToggle extends PanelMenu.Button {
    _init(settings) {
        super._init(0.0, 'Rotation Lock');

        this._appSettings = settings;
        this.settings = new Gio.Settings({
            schema_id: 'org.gnome.settings-daemon.peripherals.touchscreen'
        });

        this.icon = new St.Icon({
            icon_name: 'rotation-locked-symbolic',
            style_class: 'system-status-icon'
        });
        this.add_child(this.icon);

        // Create toggle switch in menu
        this.toggleItem = new PopupMenu.PopupSwitchMenuItem('Rotation Lock', false);
        this.toggleItem.connect('toggled', this._onToggled.bind(this));
        this.menu.addMenuItem(this.toggleItem);

        this._update();
        this.settingsChanged = this.settings.connect('changed::orientation-lock', this._update.bind(this));
    }

    _onToggled(item, state) {
        this.settings.set_boolean('orientation-lock', state);
    }

    _update() {
        let locked = this.settings.get_boolean('orientation-lock');
        this.icon.icon_name = locked ? 'rotation-locked-symbolic' : 'rotation-allowed-symbolic';
        this.toggleItem.setToggleState(locked);
    }

    destroy() {
        if (this.settingsChanged) {
            this.settings.disconnect(this.settingsChanged);
        }
        super.destroy();
    }
});
