'use strict';

const { GObject, St, Clutter } = imports.gi;
const Main = imports.ui.main;

var KeyboardToggle = GObject.registerClass(
class KeyboardToggle extends St.Bin {
    _init(settings) {
        super._init({
            style_class: 'panel-button',
            reactive: true,
            can_focus: true,
            track_hover: true
        });

        this._settings = settings;

        let icon = new St.Icon({
            icon_name: 'input-keyboard-symbolic',
            style_class: 'system-status-icon'
        });

        this.set_child(icon);

        this.connect('button-press-event', this._toggle.bind(this));
        this.connect('touch-event', this._toggle.bind(this));
    }

    _toggle() {
        if (Main.keyboard) {
            if (Main.keyboard.visible) {
                Main.keyboard.close();
            } else {
                Main.keyboard.open(Main.layoutManager.bottomIndex);
            }
        }
        return Clutter.EVENT_STOP;
    }
});
