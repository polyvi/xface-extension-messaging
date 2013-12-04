
/*
 Copyright 2012-2013, Polyvi Inc. (http://polyvi.github.io/openxface)
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

//
//  XMessagingExt.m
//  xFaceLib
//
//

#import "XMessagingExt.h"

#import <Cordova/CDVInvokedUrlCommand.h>
#import <Cordova/CDVPluginResult.h>
#import <Cordova/NSArray+Comparisons.h>
#import <Cordova/CDVDebug.h>

#define MESSAGE_TYPE           @"messageType"
#define MESSAGE_BODY           @"body"
#define MESSAGE_SUBJECT        @"subject"
#define DESTINATION_ADDRESSES  @"destinationAddresses"

#define MESSAGE_TYPE_SMS       @"SMS"
#define MESSAGE_TYPE_EMAIL     @"Email"

@interface XMessagingExt()

@property (strong) NSString* callbackId;      /**< callbackId */
@property (strong) NSString* messageType;      /**< 信息类型（目前支持SMS和Email）*/
@property (strong) NSString* destAddr;         /**< 发送的目的地址 */
@property (strong) NSString* messageBody;      /**< 要发送的内容 */
@property (strong) NSString* subject;          /**< 发送的标题（发送Email时会使用） */

- (void) openMessageView:(UINavigationController*)MessageController;
- (void) closeMessageView:(UINavigationController*)MessageController;

@end

@implementation XMessagingExt

@synthesize callbackId;
@synthesize messageType;
@synthesize destAddr;
@synthesize messageBody;
@synthesize subject;

- (id)initWithWebView:(UIWebView*)theWebView
{
    self = [super initWithWebView:theWebView];
    if (self) {
        self.callbackId = nil;
        messageType = @"";
        destAddr = @"";
        messageBody = @"";
        subject = @"";
    }
    return self;
}

- (void) resetMessage
{
    messageType = @"";
    destAddr = @"";
    messageBody = @"";
    subject = @"";
}

- (void) sendMessage:(CDVInvokedUrlCommand*)command
{
    [self resetMessage];
    self.callbackId = command.callbackId;

    // arguments maybe null; pass a NSNULL object will cause except
    if ( [NSNull null] != [command.arguments objectAtIndex:0])
    {
        self.messageType = [command.arguments objectAtIndex:0];
    }
    if ( [NSNull null] != [command.arguments objectAtIndex:1])
    {
        self.destAddr = [command.arguments objectAtIndex:1];
    }
    if ( [NSNull null] != [command.arguments objectAtIndex:2])
    {
        self.messageBody = [command.arguments objectAtIndex:2];
    }
    if ( [NSNull null] != [command.arguments objectAtIndex:3])
    {
        self.subject = [command.arguments objectAtIndex:3];
    }

    NSArray* recipients = [NSArray arrayWithObject:self.destAddr];

    // 发短信
    if([self.messageType isEqualToString:MESSAGE_TYPE_SMS])
    {
        MFMessageComposeViewController *controller = [[MFMessageComposeViewController alloc] init];
        if([MFMessageComposeViewController canSendText])
        {
            controller.body = self.messageBody;
            controller.recipients = recipients;
            controller.messageComposeDelegate = self;
            [self openMessageView:controller];
        }
    }
    // 发邮件
    else if([self.messageType isEqualToString:MESSAGE_TYPE_EMAIL])
    {
        MFMailComposeViewController *controller = [[MFMailComposeViewController alloc] init];
        if([MFMailComposeViewController canSendMail])
        {
            [controller setSubject:self.subject];
            [controller setMessageBody:self.messageBody isHTML:NO];
            [controller setToRecipients:recipients];
            controller.mailComposeDelegate = self;
            [self openMessageView:controller];
        }
    }
    else
    {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
    }
}

// 处理发送完短信的响应结果
- (void)messageComposeViewController:(MFMessageComposeViewController *)controller didFinishWithResult:(MessageComposeResult)result
{
    [self closeMessageView:controller];
    CDVPluginResult* extensionResult = nil;

    if (MessageComposeResultSent == result)
    {
        DLog(@"Message sent");
        NSMutableDictionary* message = [NSMutableDictionary dictionaryWithCapacity:3];
        [message setObject:self.messageType forKey:MESSAGE_TYPE];
        [message setObject:self.messageBody forKey:MESSAGE_BODY];
        [message setObject:self.destAddr forKey:DESTINATION_ADDRESSES];
        extensionResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:message];
    }
    else
    {
        ALog(@"Message failed");
        extensionResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:extensionResult callbackId:self.callbackId];
}

// 处理发送完邮件的响应结果
-(void)mailComposeController:(MFMailComposeViewController *)controller didFinishWithResult:(MFMailComposeResult)result error:(NSError *)error
{
    [self closeMessageView:controller];
    CDVPluginResult* extensionResult = nil;

    if (MFMailComposeResultSent == result)
    {
        DLog(@"Email sent");
        NSMutableDictionary* message = [NSMutableDictionary dictionaryWithCapacity:4];
        [message setObject:self.messageType forKey:MESSAGE_TYPE];
        [message setObject:self.messageBody forKey:MESSAGE_BODY];
        [message setObject:self.destAddr forKey:DESTINATION_ADDRESSES];
        [message setObject:self.subject forKey:MESSAGE_SUBJECT];
        extensionResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:message];
    }
    else
    {
        ALog(@"Email failed");
        extensionResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:extensionResult callbackId:self.callbackId];
}

- (void) openMessageView:(UINavigationController*)MessageController
{
    [self.viewController presentViewController:MessageController animated:YES completion:nil];
}

- (void) closeMessageView:(UINavigationController*)MessageController
{
        [MessageController dismissViewControllerAnimated:YES completion:nil];
}

@end
