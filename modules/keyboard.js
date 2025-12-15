'use strict';

const { GObject, St } = imports.gi;

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
    }

    _toggle() {
        // Toggle logic goes here
    }
});
