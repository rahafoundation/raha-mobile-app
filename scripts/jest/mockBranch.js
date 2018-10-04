import React from "react-native";
React.NativeModules.RNBranch = {
  // Mock constants exported by native layers
  ADD_TO_CART_EVENT: "Add to Cart",
  ADD_TO_WISHLIST_EVENT: "Add to Wishlist",
  PURCHASE_INITIATED_EVENT: "Purchase Started",
  PURCHASED_EVENT: "Purchased",
  REGISTER_VIEW_EVENT: "View",
  SHARE_COMPLETED_EVENT: "Share Completed",
  SHARE_INITIATED_EVENT: "Share Started",

  STANDARD_EVENT_ADD_TO_CART: "ADD_TO_CART",
  STANDARD_EVENT_ADD_TO_WISHLIST: "ADD_TO_WISHLIST",
  STANDARD_EVENT_VIEW_CART: "VIEW_CART",
  STANDARD_EVENT_INITIATE_PURCHASE: "INITIATE_PURCHASE",
  STANDARD_EVENT_ADD_PAYMENT_INFO: "ADD_PAYMENT_INFO",
  STANDARD_EVENT_PURCHASE: "PURCHASE",
  STANDARD_EVENT_SPEND_CREDITS: "SPEND_CREDITS",

  STANDARD_EVENT_SEARCH: "SEARCH",
  STANDARD_EVENT_VIEW_ITEM: "VIEW_ITEM",
  STANDARD_EVENT_VIEW_ITEMS: "VIEW_ITEMS",
  STANDARD_EVENT_RATE: "RATE",
  STANDARD_EVENT_SHARE: "SHARE",

  STANDARD_EVENT_COMPLETE_REGISTRATION: "COMPLETE_REGISTRATION",
  STANDARD_EVENT_COMPLETE_TUTORIAL: "COMPLETE_TUTORIAL",
  STANDARD_EVENT_ACHIEVE_LEVEL: "ACHIEVE_LEVEL",
  STANDARD_EVENT_UNLOCK_ACHIEVEMENT: "UNLOCK_ACHIEVEMENT",

  redeemInitSessionResult() {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(defaultSession), 500);
    });
  },

  disableTracking(disable) {
    // Just mock user tracking enable/disable
    trackingDisabled = disable;
  },

  isTrackingDisabled() {
    return new Promise((resolve, reject) => {
      resolve(trackingDisabled);
    });
  }
};

// This only has to exist to be passed to the NativeEventEmitter
// constructor.
React.NativeModules.RNBranchEventEmitter = {};
