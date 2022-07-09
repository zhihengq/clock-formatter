'use strict';

const Main = imports.ui.main;
const { GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

class Extension {
    constructor() {
        this.clear();
    }

    clear() {
        this._settings = ExtensionUtils.getSettings(Me.metadata['settings-schema']);
        this._settingsSignalId = null;
        this._clock = null;
        this._clockSignalId = null;
        this._restoreTo = null;
        this._overriding = false;
    }

    update() {
        try {
            const text = this._clock.get_text();
            const format = this._settings.get_string('format');
            const time = GLib.DateTime.new_now_local().format(format) ?? 'Format Error';
            if (text != time) {
                this._restoreTo = text;
                this._clock.set_text(time);
            }
        } catch (e) {
            this.disable();
            throw e;
        }
    }

    enable() {
        this._clock = Main.panel.statusArea.dateMenu.labelActor;
        if (!this._clock) {
            log('Failed to get the date menu label');
            return;
        }
        this._clockSignalId = this._clock.connect('notify::text', () => this.update());
        this._settingsSignalId = this._settings.connect('changed', () => this.update());
        this.update();
    }

    disable() {
        if (this._clock) {
            if (this._clockSignalId) {
                this._clock.disconnect(this._clockSignalId);
            }
            this._clock.set_text(this._restoreTo);
        }
        if (this._settingsSignalId) {
            this._settings.disconnect(this._settingsSignalId);
        }
        this.clear();
    }
}

function init() {
    return new Extension();
}
