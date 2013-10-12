/*
 Copyright 2012-2013, Polyvi Inc. (http://www.xface3.com)
 This program is distributed under the terms of the GNU General Public License.

 This file is part of xFace.

 xFace is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 xFace is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with xFace.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * 该模块定义发送，获取和查找短信相关的一些功能.
 * @module message
 * @main message
 */

/**
 * 该类实现了对短信的一系列操作，包括新建短信，发送短信，查找短信等（Android, iOS, WP8）<br/>
 * 该类不能通过new来创建相应的对象，只能通过xFace.Messaging对象来直接使用该类中定义的方法<br/>
 * 相关参考： {{#crossLink "Message"}}{{/crossLink}}, {{#crossLink "MessageTypes"}}{{/crossLink}}, {{#crossLink "MessageFolderTypes"}}{{/crossLink}}
 * @class Messaging
 * @static
 * @platform Android, iOS, WP8
 * @since 3.0.0
 */
var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    Message = require('./Message');

var Messaging = function() {
    this.onReceived = null;
};

/**
 * 新建信息，根据messageType新建信息，目前支持短息和Email类型（Android, iOS, WP8）<br/>
 * @example
        xFace.Messaging.createMessage(MessageTypes.SMSMessage, successCallback, errorCallback);
        function successCallback(message){alert(message.type);}
        function errorCallback(){alert("failed");}
 * @method createMessage
 * @param {String} messageType 信息类型（如MMS,SMS,Email），取值范围见{{#crossLink "xFace.MessageTypes"}}{{/crossLink}}
 * @param {Function} successCallback 成功回调函数
 * @param {Message} successCallback.message 生成的信息对象，参见 {{#crossLink "Message"}}{{/crossLink}}
 * @param {Function} [errorCallback]   失败回调函数
 * @platform Android, iOS, WP8
 * @since 3.0.0
 */
Messaging.prototype.createMessage = function(messageType, successCallback, errorCallback) {
    argscheck.checkArgs('sfF', 'xFace.Messaging.createMessage', arguments);
    //TODO:根据messageType创建不同类型的信息，目前只处理了短消息
    var MessageTypes = require('./MessageTypes');
    if((messageType != MessageTypes.EmailMessage&&
       messageType != MessageTypes.MMSMessage&&
       messageType != MessageTypes.SMSMessage)){
        if(errorCallback && typeof errorCallback == "function") {
            errorCallback();
        }
        return;
    }
    var result = new Message();
    result.messageType = messageType;
    successCallback(result);
};

/**
 * 发送信息，目前支持发送短信和Email（Android, iOS, WP8）<br/>
 * @example
        xFace.Messaging.sendMessage (message, success, errorCallback);
        function success(statusCode) {alert("success : " + statusCode);}
        function errorCallback(errorCode){alert("fail : " + errorCode);

 * @method sendMessage
 * @param {Message} message 要发送的信息对象，参见{{#crossLink "Message"}}{{/crossLink}}
 * @param {Function} [successCallback] 成功回调函数
 * @param {Number} successCallback.code   状态码: 0：发送成功；
 * @param {Function} [errorCallback]   失败回调函数
 * @param {Number} errorCallback.code   状态码: 1：通用错误；2：无服务；3：没有PDU提供；4：天线关闭；
 * @platform Android, iOS, WP8
 * @since 3.0.0
 */
Messaging.prototype.sendMessage = function(message, successCallback, errorCallback){
    argscheck.checkArgs('oFF', 'xFace.Messaging.sendMessage', arguments);
    exec(successCallback, errorCallback, "Messaging", "sendMessage", [message.messageType, message.destinationAddresses, message.body, message.subject]);
};

/**
 * 获取指定信息文件夹的信息数量，不支持读取SIM卡内信息（Android）<br/>
 * @example
        xFace.Messaging.getQuantities (xFace.MessageTypes.SMSMessage, xFace.MessageFolderTypes.INBOX, successCallback, errorCallback);
        function successCallback(num){
            alert("收件箱中有"+num+"条短信");}
        function errorCallback(){alert("failed");}
 * @method getQuantities
 * @for Messaging
 * @param {String} messageType 信息类型，取值范围见{{#crossLink "MessageTypes"}}{{/crossLink}}
 * @param {String} folderType  文件夹类型，取值范围见{{#crossLink "MessageFolderTypes"}}{{/crossLink}}
 * @param {Function} [successCallback] 成功回调函数
 * @param {Number} successCallback.num   获取到的信息数量
 * @param {Function} [errorCallback]   失败回调函数
 * @platform Android
 * @since 3.0.0
 */
Messaging.prototype.getQuantities = function(messageType, folderType, successCallback, errorCallback) {
    argscheck.checkArgs('ssfF', 'Messaging.getQuantities', arguments);
    exec(
        function(result) {
            successCallback(result);
        },
        errorCallback, "Messaging", "getQuantities", [messageType, folderType]);
};

/**
 * 获取指定文件夹类型中的指定索引位置的信息，不支持读取SIM卡内信息（Android）<br/>
 * @example
        xFace.Messaging.getMessage (MessageTypes.SMSMessage, xFace.MessageFolderTypes.INBOX, 0, successCallback, errorCallback);
        function successCallback(message) { alert(message.body);}
        function errorCallback(){alert("failed");}
 * @method getMessage
 * @for Messaging
 * @param {String} messageType 信息类型，取值范围见{{#crossLink "MessageTypes"}}{{/crossLink}}
 * @param {String} folderType  文件夹类型，取值范围见{{#crossLink "MessageFolderTypes"}}{{/crossLink}}
 * @param {Number} index           要获取的短信索引
 * @param {Function} [successCallback] 成功回调函数
 * @param {Message} successCallback.message 获取到的信息对象，参见 {{#crossLink "Message"}}{{/crossLink}}
 * @param {Function} [errorCallback]   失败回调函数
 * @platform Android
 * @since 3.0.0
 */
Messaging.prototype.getMessage = function(messageType, folderType, index, successCallback, errorCallback) {
    argscheck.checkArgs('ssnfF', 'Messaging.getMessage', arguments);
     var win = typeof successCallback !== 'function' ? null : function(result) {
        var message = new Message(result.messageId, result.subject, result.body, result.destinationAddresses,
                            result.messageType, new Date(result.date), result.isRead);
        successCallback(message);
    };
    exec(win, errorCallback, "Messaging", "getMessage", [messageType, folderType, index]);
};

/**
 * 获取某个文件夹中的所有信息，不支持读取SIM卡内信息（Android）<br/>
 * @example
        xFace.Messaging.getAllMessages (MessageTypes.SMSMessage, xFace.MessageFolderTypes.INBOX, successCallback, errorCallback);
        function successCallback(messages){  alert(messages.length);}
        function errorCallback(){alert("failed");}
 * @method getAllMessages
 * @for Messaging
 * @param {String} messageType 信息类型，取值范围见{{#crossLink "MessageTypes"}}{{/crossLink}}
 * @param {String} folderType  文件夹类型，取值范围见{{#crossLink "MessageFolderTypes"}}{{/crossLink}}
 * @param {Function} [successCallback] 成功回调函数
 * @param {Array} successCallback.messages 获取到的所有信息对象，该数组对象中的每个元素为一个{{#crossLink "xFace.Message"}}{{/crossLink}}类型对象
 * @param {Function} [errorCallback]   失败回调函数
 * @platform Android
 * @since 3.0.0
 */
Messaging.prototype.getAllMessages =function(messageType, folderType, successCallback, errorCallback) {
    argscheck.checkArgs('ssfF', 'Messaging.getAllMessages', arguments);
    var win = typeof successCallback !== 'function' ? null : function(result) {
        var retVal = [];
        for (var i = 0; i < result.length; i++) {
            var message = new Message(result[i].messageId, result[i].subject, result[i].body, result[i].destinationAddresses,
                                result[i].messageType, new Date(result[i].date), result[i].isRead);
            retVal.push(message);
        }
        successCallback(retVal);
    };
    exec(win, errorCallback, "Messaging", "getAllMessages", [messageType, folderType]);
};

/**
 * 在指定文件夹中查找匹配的信息，不支持读取SIM卡内信息（Android）<br/>
 * @example
        Messaging.findMessages (message, MessageFolderTypes.INBOX, 0, 3, success, errorCallback);
        function success(messages) {alert(messages.length);}
        function errorCallback(){alert("failed");}
 * @method findMessages
 * @for Messaging
 * @param {Message} comparisonMsg   要查找的信息，参见{{#crossLink "Message"}}{{/crossLink}}
 * @param {String} folderType  文件夹类型，取值范围见{{#crossLink "MessageFolderTypes"}}{{/crossLink}}
 * @param {Number} startIndex  起始索引
 * @param {Number} endIndex  结束索引
 * @param {Function} [successCallback] 成功回调函数
 * @param {Array} successCallback.messages 查找到的所有信息对象，该数组对象中的每个元素为一个{{#crossLink "xFace.Message"}}{{/crossLink}}类型对象
 * @param {Function} [errorCallback]   失败回调函数
 * @platform Android
 * @since 3.0.0
 */
Messaging.prototype.findMessages = function(comparisonMsg, folderType, startIndex, endIndex, successCallback, errorCallback) {
    argscheck.checkArgs('osnnfF', 'Messaging.findMessages', arguments);
    var comparison = {messageId:"", subject:"", destinationAddresses:"", body:"", isRead:-1};
    if(null !== comparisonMsg){
        comparison.messageId = comparisonMsg.messageId || "";
        comparison.subject = comparisonMsg.subject || "";
        comparison.destinationAddresses = comparisonMsg.destinationAddresses || "";
        comparison.body = comparisonMsg.body || "";
        if(null === comparisonMsg.isRead) {
            comparison.isRead = -1;
        }
        else if(comparisonMsg.isRead) {
            comparison.isRead = 1;
        }
        else {
            comparison.isRead = 0;
        }
    }
    var win = typeof successCallback !== 'function' ? null : function(result) {
        var retVal = [];
        for(var i = 0 ; i < result.length ; i++){
            var message = new Message(result[i].messageId, result[i].subject, result[i].body, result[i].destinationAddresses, result[i].messageType,
                                        new Date(result[i].date), result[i].isRead);
            retVal.push(message);
        }
        successCallback(retVal);
    };
    exec(win, errorCallback, "Messaging", "findMessages", [comparison, folderType, startIndex, endIndex]);
};

/**
* 当收到短信的回调函数
*/
Messaging.prototype.fire = function(msgs) {
    if (this.onReceived) {
        this.onReceived(msgs);
    }
};

/**
* 注册一个监听器, 当手机收到短信的时候，该监听器会被回调(Android, iOS, WP8)<br/>
* @example
        xFace.Messaging.registerOnMessageReceivedListener(printMessage);
        function printMessage(msgs){
                alert(msgs);
            }
*@method registerOnMessageReceivedListener
*@param {Function} listener 收到短信的监听
*@param {String} listener.msgs 收到短信的内容
*@platform Android, iOS, WP8
*@since 3.0.0
*/
Messaging.prototype.registerOnMessageReceivedListener = function(listener) {

    argscheck.checkArgs('f', 'Messaging.registerOnMessageReceivedListener', arguments);
    this.onReceived = listener;
    exec(null, null,"Messaging", "registerOnMessageReceivedListener", []);

};

module.exports = new Messaging();
