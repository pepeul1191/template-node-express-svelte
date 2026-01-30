// web/helpers.js

export const extractFlashMessages = (req) => {
  return {
    success_messages: req.flash('success'),
    error_messages: req.flash('error'),
    warning_messages: req.flash('warning'),
    info_messages: req.flash('info'),
    hasFlashMessages: function() {
      return this.success_messages.length > 0 ||
             this.error_messages.length > 0 ||
             this.warning_messages.length > 0 ||
             this.info_messages.length > 0;
    }
  };
};