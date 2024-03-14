/**
 * Portal definitions
 */

export class PortalDefs {
  static readonly apiMessageType              = "nap::APIMessage";              ///< Type of an API message
  static readonly eventHeaderName             = "portal_event_header";          ///< Name of the portal event header
  static readonly portalIDArgName             = "portal_id";                    ///< Name of the argument containing the portal ID in the portal event header
  static readonly eventTypeArgName            = "portal_event_type";            ///< Name of the argument containing the portal event type in the portal event header
  static readonly itemTypeArgName             = "portal_item_type";             ///< Name of the argument containing the portal item type in the portal item message
  static readonly itemValueArgName            = "portal_item_value";            ///< Name of the argument containing the portal item value in the portal item message
  static readonly itemMinArgName              = "portal_item_min";              ///< Name of the argument containing the minimum portal item value in the portal item message
  static readonly itemMaxArgName              = "portal_item_max";              ///< Name of the argument containing the maximum portal item value in the portal item message
  static readonly itemClampArgName            = "portal_item_clamp";            ///< Name of the argument containing the clamp value in the portal item message
  static readonly dropDownItemNames           = "portal_dropdown_item_names";   ///< Name of the argument containing all drop down item names
  static readonly itemVisibleArgName          = "portal_item_visible";          ///< Name of the argument if the item should be visible or not
  static readonly itemEnabledArgName          = "portal_item_enabled";          ///< Name of the argument if the item should be enabled or not
  static readonly itemPaddingArgName          = "portal_item_padding";          ///< Name of the argument that contains item padding
  static readonly itemColorArgName            = "portal_item_color";            ///< Name of the argument if the item should be enabled or not
  static readonly itemFontWeightArgName       = "portal_item_font_weight";      ///< Name of the argument that contains font weight
  static readonly itemAlignmentArgName        = "portal_item_alignment";        ///< Name of the argument that contains item alignment (only available for buttons)
  static readonly itemFontSizeArgName         = "portal_item_fontsize";         ///< Name of the argument that contains font size
  static readonly itemSelectedArgName         = "portal_item_selected";         ///< Name of the argument that contains selected state
  static readonly itemWidthArgName            = "portal_item_width";
  static readonly openDialogEventName         = 'open_dialog';
  static readonly dialogClosedEventName       = 'dialog_closed';
  static readonly dialogTitleArgName          = 'dialog_title';
  static readonly dialogContentArgName        = 'dialog_content';
  static readonly dialogOptionsArgName        = 'dialog_options';
  static readonly dialogSelectionArgName      = 'dialog_selection_value';
  static readonly dialogSelectionTypeArgName  = 'dialog_selection_type';
}


/**
 * API message
 */

 export interface APIMessage {
  Type: typeof PortalDefs.apiMessageType,
  mID: string,
  Name: string,
  Arguments: Array<APIArgument>,
};


/**
 * API argument
 */
export interface APIArgument {
  Type: APIArgumentType,
  mID: string,
  Name: string,
  Value: APIArgumentValue,
};

export interface APIArgumentString extends APIArgument {
  Type: APIArgumentType.String,
  Value: string,
}

export interface APIArgumentStringArray extends APIArgument {
  Type: APIArgumentType.StringArray,
  Value: Array<string>,
}

export interface APIArgumentBoolean extends APIArgument {
  Type: APIArgumentType.Boolean,
  Value: boolean,
}

export interface APIArgumentBooleanArray extends APIArgument {
  Type: APIArgumentType.BooleanArray,
  Value: Array<boolean>,
}

export interface APIArgumentNumeric extends APIArgument {
  Type: APIArgumentType.Byte |
        APIArgumentType.Int |
        APIArgumentType.Long |
        APIArgumentType.Float |
        APIArgumentType.Double,
  Value: number,
}

export interface APIArgumentNumericArray extends APIArgument {
  Type: APIArgumentType.ByteArray |
        APIArgumentType.IntArray |
        APIArgumentType.LongArray |
        APIArgumentType.FloatArray |
        APIArgumentType.DoubleArray,
  Value: Array<number>,
}

export enum APIArgumentType {
  String        = 'nap::APIString',
  StringArray   = 'nap::APIStringArray',
  Boolean       = 'nap::APIBool',
  BooleanArray  = 'nap::APIBoolArray',
  Byte          = 'nap::APIByte',
  ByteArray     = 'nap::APIByteArray',
  Int           = 'nap::APIInt',
  IntArray      = 'nap::APIIntArray',
  Long          = 'nap::APILong',
  LongArray     = 'nap::APILongArray',
  Float         = 'nap::APIFloat',
  FloatArray    = 'nap::APIFloatArray',
  Double        = 'nap::APIDouble',
  DoubleArray   = 'nap::APIDoubleArray',
};

// Array containing all available API argument types, useful for validation
export const APIArgumentTypes: Array<string> = Object.values(APIArgumentType);

export type APIArgumentValue =
  string | Array<string> |
  number | Array<number> |
  boolean | Array<boolean>;


/**
 * Portal event
 */

export type PortalEvent = {
  Objects: [
    PortalEventHeader,
    ...Array<APIMessage>,
  ],
};

export interface PortalEventHeaderInfo {
  eventId: string,
  portalId: string,
  eventType: PortalEventType,
};

export interface PortalEventHeader extends APIMessage {
  Name: typeof PortalDefs.eventHeaderName,
  Arguments: [
    PortalIdArgument,
    PortalEventTypeArgument,
  ],
};

export interface PortalIdArgument extends APIArgument {
  Type: APIArgumentType.String,
  Name: typeof PortalDefs.portalIDArgName,
  Value: string,
};

export interface PortalEventTypeArgument extends APIArgument {
  Type: APIArgumentType.String,
  Name: typeof PortalDefs.eventTypeArgName,
  Value: PortalEventType,
};

export enum PortalEventType {
  Request = 'Request',
  Response = 'Response',
  UpdateValue = 'ValueUpdate',
  UpdateState = 'StateUpdate',
  Reload = 'Reload',
  OpenDialog = 'OpenDialog',
  DialogClosed = 'DialogClosed',
  Invalid = 'Invalid',
};

export enum PortalItemAlignment {
  Left = 'Left',
  Right = 'Right'
};

// Array containing all available portal event types, useful for validation
export const PortalEventTypes: Array<string> = Object.values(PortalEventType);


/**
 * Portal item
 */

export enum PortalItemType {
  DropDown            = 'nap::PortalItemDropDown',
  Button              = 'nap::PortalItemButton',
  ColorRGB8           = 'nap::PortalItemRGBColor8',
  ColorRGBA8          = 'nap::PortalItemRGBAColor8',
  ColorRGBFloat       = 'nap::PortalItemRGBColorFloat',
  ColorRGBAFloat      = 'nap::PortalItemRGBAColorFloat',
  OperationalCalendar = 'nap::PortalItemOperationalCalendar',
  SliderByte          = 'nap::PortalItemSliderByte',
  SliderInt           = 'nap::PortalItemSliderInt',
  SliderLong          = 'nap::PortalItemSliderLong',
  SliderFloat         = 'nap::PortalItemSliderFloat',
  SliderDouble        = 'nap::PortalItemSliderDouble',
  TextArea            = 'nap::PortalItemTextArea',
  TextField           = 'nap::PortalItemTextField',
  Label               = 'nap::PortalItemLabel',
  Toggle              = 'nap::PortalItemToggle',
  Vec2                = 'nap::PortalItemVec2',
  Vec3                = 'nap::PortalItemVec3',
  IVec2               = 'nap::PortalItemIVec2',
  IVec3               = 'nap::PortalItemIVec3',
  Separator           = 'nap::PortalItemSeparator',
  StaticLabel         = 'nap::PortalItemStaticLabel'
};

// Array containing all available portal item types, useful for validation
export const PortalItemTypes: Array<string> = Object.values(PortalItemType);

export interface PortalItemUpdateInfo {
  id: string,
  name: string,
  type: APIArgumentType,
  value: APIArgumentValue,
};

export interface PortalItemUpdate extends APIMessage {
  Arguments: [PortalItemValueArgument],
}

export interface PortalItemValueArgument extends APIArgument {
  Name: typeof PortalDefs.itemValueArgName,
}

export enum PortalItemButtonEvent {
  Click = 'Click',
  Press = 'Press',
  Release = 'Release',
  Invalid = 'Invalid',
};
