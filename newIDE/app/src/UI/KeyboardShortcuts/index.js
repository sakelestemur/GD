// @flow
import { isMacLike } from '../../Utils/Platform';

export const MOVEMENT_BIG_DELTA = 5;

const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;
const EQUAL_KEY = 187;
const MINUS_KEY = 189;
const SPACE_KEY = 32;
const NUMPAD_ADD = 107;
const NUMPAD_SUBTRACT = 109;
const C_KEY = 67;
const F_KEY = 70;
const V_KEY = 86;
const X_KEY = 88;
const Y_KEY = 89;
const Z_KEY = 90;
const KEY_1 = 49;
const KEY_2 = 50;
const KEY_3 = 51;
const KEY_1_NUMPAD = 97;
const KEY_2_NUMPAD = 98;
const KEY_3_NUMPAD = 99;
const ESC_KEY = 27;

const MID_MOUSE_BUTTON = 1;

type ShortcutCallbacks = {|
  onDelete?: () => void,
  onMove?: (number, number) => void,
  onCopy?: () => void,
  onCut?: () => void,
  onPaste?: () => void,
  onUndo?: () => void,
  onRedo?: () => void,
  onSearch?: () => void,
  onZoomOut?: KeyboardEvent => void,
  onZoomIn?: KeyboardEvent => void,
  onEscape?: () => void,
  onShift1?: () => void,
  onShift2?: () => void,
  onShift3?: () => void,
|};

type ConstructorArgs = {|
  isActive?: () => boolean,
  shortcutCallbacks: ShortcutCallbacks,
|};

/**
 * Listen to keyboard shorcuts and call callbacks according to them.
 * Also store the state of the modifier keys (shift, ctrl, alt, meta) to know
 * if some special operations (multi selection, selection duplication) must
 * be done.
 *
 * `onKeyDown`, `onKeyUp` and other methods handling events (`onDragOver`...)
 * must be binded to the `div` element containing your component. We're not
 * using `document` to avoid issues with shortcuts being detected while a
 * component is not focused.
 */
export default class KeyboardShortcuts {
  _shortcutCallbacks: ShortcutCallbacks;
  _isActive: ?() => boolean;
  _shiftPressed = false;
  _ctrlPressed = false;
  _altPressed = false;
  _metaPressed = false;
  _mouseMidButtonPressed = false;
  _spacePressed = false;

  constructor({ isActive, shortcutCallbacks }: ConstructorArgs) {
    this._shortcutCallbacks = shortcutCallbacks;
    this._isActive = isActive;
  }

  shouldCloneInstances() {
    return this._isControlOrCmdPressed();
  }

  shouldMultiSelect() {
    return this._shiftPressed;
  }

  shouldFollowAxis() {
    return this._shiftPressed;
  }

  shouldNotSnapToGrid() {
    return this._altPressed;
  }

  shouldResizeProportionally() {
    return this._shiftPressed;
  }

  shouldScrollHorizontally() {
    return this._altPressed;
  }

  shouldMoveView() {
    return this._spacePressed || this._mouseMidButtonPressed;
  }

  shouldZoom() {
    if (isMacLike()) {
      return this._isControlOrCmdPressed();
    } else {
      return (
        !this._isControlOrCmdPressed() &&
        !this._altPressed &&
        !this._shiftPressed
      );
    }
  }

  _updateModifiersFromEvent = (evt: KeyboardEvent | DragEvent) => {
    this._metaPressed = evt.metaKey;
    this._altPressed = evt.altKey;
    this._ctrlPressed = evt.ctrlKey;
    this._shiftPressed = evt.shiftKey;
  };

  _updateSpecialKeysStatus = (evt: KeyboardEvent, isDown: boolean) => {
    if (evt.which === SPACE_KEY) {
      this._spacePressed = isDown;
    }
  };

  _isControlOrCmdPressed = () => {
    // On macOS, meta key (Apple/Command key) acts as Control key on Windows/Linux.
    return this._metaPressed || this._ctrlPressed;
  };

  onMouseDown = (evt: MouseEvent) => {
    if (evt.button === MID_MOUSE_BUTTON) {
      this._mouseMidButtonPressed = true;
    } else {
      this._mouseMidButtonPressed = false;
    }
  };

  onMouseUp = (evt: MouseEvent) => {
    if (evt.button === MID_MOUSE_BUTTON) {
      this._mouseMidButtonPressed = false;
    }
  };

  onDragOver = (evt: DragEvent) => {
    this._updateModifiersFromEvent(evt);
  };

  onKeyUp = (evt: KeyboardEvent) => {
    this._updateModifiersFromEvent(evt);
    this._updateSpecialKeysStatus(evt, false);
  };

  onKeyDown = (evt: KeyboardEvent) => {
    this._updateModifiersFromEvent(evt);

    if (this._isActive && !this._isActive()) return;

    const textEditorSelectors = 'textarea, input, [contenteditable="true"]';
    // $FlowFixMe
    if (evt.target && evt.target.closest(textEditorSelectors)) {
      return; // Something else is currently being edited.
    }

    this._updateSpecialKeysStatus(evt, true);

    const {
      onDelete,
      onMove,
      onCopy,
      onCut,
      onPaste,
      onUndo,
      onRedo,
      onSearch,
      onZoomOut,
      onZoomIn,
      onEscape,
      onShift1,
      onShift2,
      onShift3,
    } = this._shortcutCallbacks;

    if (onMove) {
      if (evt.which === UP_KEY) {
        evt.preventDefault();
        this._shiftPressed ? onMove(0, -5) : onMove(0, -1);
      } else if (evt.which === DOWN_KEY) {
        evt.preventDefault();
        this._shiftPressed ? onMove(0, 5) : onMove(0, 1);
      } else if (evt.which === LEFT_KEY) {
        evt.preventDefault();
        this._shiftPressed ? onMove(-5, 0) : onMove(-1, 0);
      } else if (evt.which === RIGHT_KEY) {
        evt.preventDefault();
        this._shiftPressed ? onMove(5, 0) : onMove(1, 0);
      }
    }
    if (onDelete && (evt.which === BACKSPACE_KEY || evt.which === DELETE_KEY)) {
      evt.preventDefault();
      onDelete();
    }
    if (onCopy && this._isControlOrCmdPressed() && evt.which === C_KEY) {
      evt.preventDefault();
      onCopy();
    }
    if (onCut && this._isControlOrCmdPressed() && evt.which === X_KEY) {
      evt.preventDefault();
      onCut();
    }
    if (onPaste && this._isControlOrCmdPressed() && evt.which === V_KEY) {
      evt.preventDefault();
      onPaste();
    }
    if (
      (onUndo || onRedo) &&
      this._isControlOrCmdPressed() &&
      evt.which === Z_KEY
    ) {
      evt.preventDefault();
      if (evt.shiftKey) {
        if (onRedo) onRedo();
      } else {
        if (onUndo) onUndo();
      }
    }

    if (onRedo && this._isControlOrCmdPressed() && evt.which === Y_KEY) {
      evt.preventDefault();
      onRedo();
    }
    if (onSearch && this._isControlOrCmdPressed() && evt.which === F_KEY) {
      evt.preventDefault();
      onSearch();
    }
    if (onEscape && evt.which === ESC_KEY) {
      evt.preventDefault();
      onEscape();
    }

    if (onZoomOut && this._isControlOrCmdPressed() && evt.which === MINUS_KEY) {
      evt.preventDefault();
      onZoomOut(evt);
    }
    if (onZoomOut && evt.which === NUMPAD_SUBTRACT) {
      evt.preventDefault();
      onZoomOut(evt);
    }

    if (onZoomIn && this._isControlOrCmdPressed() && evt.which === EQUAL_KEY) {
      evt.preventDefault();
      onZoomIn(evt);
    }
    if (onZoomIn && evt.which === NUMPAD_ADD) {
      evt.preventDefault();
      onZoomIn(evt);
    }
    if (
      onShift1 &&
      this._shiftPressed &&
      (evt.which === KEY_1 || evt.which === KEY_1_NUMPAD)
    ) {
      evt.preventDefault();
      onShift1();
    }
    if (
      onShift2 &&
      this._shiftPressed &&
      (evt.which === KEY_2 || evt.which === KEY_2_NUMPAD)
    ) {
      evt.preventDefault();
      onShift2();
    }
    if (
      onShift3 &&
      this._shiftPressed &&
      (evt.which === KEY_3 || evt.which === KEY_3_NUMPAD)
    ) {
      evt.preventDefault();
      onShift3();
    }
  };
}
