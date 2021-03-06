const functions = require('firebase-functions');
var CryptoJS = require("crypto-js");
var SECRET_KEY = 'D8AmnR2OYYS9owNghyFd';
// var _ = require('lodash');


// "client_email": "firebase-adminsdk-8zj9g@dev-sportivity.iam.gserviceaccount.com"
// "client_email": "firebase-adminsdk-fb9wl@dev-sportivity.iam.gserviceaccount.com",

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
var serviceAccount = require("./serviceAccountKey.json");
// admin.initializeApp(functions.config().firebase);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cara-patient-85c2e.firebaseio.com/"
});

//
exports.helloWorld = functions.https.onRequest((request, response) => {
    // Do our logic
    // let objUser = {};
    // objUser.firstName = 'Nirmalsinh'
    // objUser.lastName = 'Rathod'
    // objUser.profilePic = 'ProfilePicture/FB1578818045507271.jpg'
    // objUser.userId = '5b0fff21-fe75-e811-80c3-0003ff6d7265'
    // processUser('5b0fff21-fe75-e811-80c3-0003ff6d7265', objUser, admin, false)
    response.send("Hello from Cara.....!");
});


exports.checkForLocalUserInfo = functions.https.onRequest((request, response) => {
    // const chatId = request.query.    ;
    let ids = request.query.userId;
    var userIds = ids.split(",");


    var path = []
    userIds.map((currentUserId, index) => {
        console.log('ID Update: ', currentUserId)
        var getUserData = admin.database().ref('/users/' + currentUserId).once('value');
        // console.log('getUserData: ', getUserData)
        path.push(getUserData)
    })
    // response.send(JSON.stringify(path))
    Promise.all(path).then(values => {
        var allMultipathData = {} // Helps to update in batch 
        let chatId = request.query.chatId
        for (var i = 0; i < values.length; i++) {
            let userInfo = values[i].val()
            let currentUserId = userInfo.userId
            //Create a local object for update
            let objUser = {};
            objUser.firstName = userInfo.firstName
            objUser.lastName = userInfo.lastName
            objUser.profilePic = userInfo.profilePic
            objUser.userId = currentUserId
            // Also check if deviceToken is available then add into static array, so it will be update
            if (userInfo.deviceToken) {
                objUser.deviceToken = userInfo.deviceToken
            } else {
                objUser.deviceToken = null; // need to remove the device token if its not there
            }


            // Added user Object into chat list memeberStatus and allMembers
            allMultipathData["/chatList/" + chatId + "/memberStatus/" + currentUserId] = true
            allMultipathData["/chatList/" + chatId + "/allMembers/" + currentUserId] = objUser

            // Added object to main connection.
            allMultipathData["/userConnection/" + currentUserId + "/" + chatId] = 0
        }
        printConsole(JSON.stringify(allMultipathData))
        response.send('Done with new changes')
        // let userInfo = values[0].val()

        // //Create a local object for update
        // let objUser = {};
        // objUser.firstName = userInfo.firstName
        // objUser.lastName = userInfo.lastName
        // objUser.profilePic = userInfo.profilePic
        // objUser.userId = currentUserId
        // // Also check if deviceToken is available then add into static array, so it will be update
        // if (userInfo.deviceToken) {
        //     objUser.deviceToken = userInfo.deviceToken
        // } else {
        //     objUser.deviceToken = null; // need to remove the device token if its not there
        // }


        // // Added user Object into chat list memeberStatus and allMembers
        // allMultipathData["/chatList/" + chatId + "/memberStatus/" + currentUserId] = true
        // allMultipathData["/chatList/" + chatId + "/allMembers/" + currentUserId] = objUser

        // // Added object to main connection.
        // allMultipathData["/userConnection/" + currentUserId + "/" + chatId] = 0


        //     // printConsole(JSON.stringify(allMultipathData))
        // admin.database().ref('/').update(allMultipathData, function (error) {
        //     if (error) {
        //         response.send("Error updating data:", error);
        //     }
        //     response.send('User added to chat successfully.... ')
        // });
        // response.send(JSON.stringify(values))
    });
    // response.send(JSON.stringify(userIds))
});


exports.addUserToChat = functions.https.onRequest((request, response) => {
    //const chatId = request.query.chatId;
    let ids = request.query.userId;
    var userIds = ids.split(",");
    printConsole('All UserIds: ' + JSON.stringify(userIds))

    var path = []
    userIds.map((currentUserId, index) => {
        var getUserData = admin.database().ref('/users/' + currentUserId).once('value');
        path.push(getUserData)
    })

    Promise.all(path).then(values => {
        var allMultipathData = {} // Helps to update in batch 
        let chatId = request.query.chatId
        printConsole('AllValue: ' + JSON.stringify(values))
        for (var i = 0; i < values.length; i++) {
            let userInfo = values[i].val()
            let currentUserId = userInfo.userId
            //Create a local object for update
            let objUser = {};
            objUser.firstName = userInfo.firstName
            objUser.lastName = userInfo.lastName
            objUser.profilePic = userInfo.profilePic
            objUser.userId = currentUserId
            // Also check if deviceToken is available then add into static array, so it will be update
            if (userInfo.deviceToken) {
                objUser.deviceToken = userInfo.deviceToken
            } else {
                objUser.deviceToken = null; // need to remove the device token if its not there
            }

            // Added user Object into chat list memeberStatus and allMembers
            allMultipathData["/chatList/" + chatId + "/memberStatus/" + currentUserId] = true
            allMultipathData["/chatList/" + chatId + "/allMembers/" + currentUserId] = objUser
            allMultipathData["/chatList/" + chatId + "/onlineMembers/" + currentUserId] = false

            // Added object to main connection.
            allMultipathData["/userConnection/" + currentUserId + "/" + chatId] = 0
        }
        printConsole(JSON.stringify(allMultipathData))
        // response.send('Done with new changes')

        admin.database().ref('/').update(allMultipathData, function (error) {
            if (error) {
                response.send("Error updating data:", error);
            }
            response.send('User added to chat successfully.... ')
        });
        //     response.send(JSON.stringify(values))
    });
    // userIds.map((currentUserId, index) => {
    //     const getUserData = admin.database().ref('/users/' + currentUserId).once('value');
    //     Promise.all([getUserData]).then(values => {
    //         var allMultipathData = {} // Helps to update in batch 

    //         let userInfo = values[0].val()

    //         //Create a local object for update
    //         let objUser = {};
    //         objUser.firstName = userInfo.firstName
    //         objUser.lastName = userInfo.lastName
    //         objUser.profilePic = userInfo.profilePic
    //         objUser.userId = currentUserId
    //         // Also check if deviceToken is available then add into static array, so it will be update
    //         if (userInfo.deviceToken) {
    //             objUser.deviceToken = userInfo.deviceToken
    //         } else {
    //             objUser.deviceToken = null; // need to remove the device token if its not there
    //         }


    //         // Added user Object into chat list memeberStatus and allMembers
    //         allMultipathData["/chatList/" + chatId + "/memberStatus/" + currentUserId] = true
    //         allMultipathData["/chatList/" + chatId + "/allMembers/" + currentUserId] = objUser

    //         // Added object to main connection.
    //         allMultipathData["/userConnection/" + currentUserId + "/" + chatId] = 0


    //         // printConsole(JSON.stringify(allMultipathData))
    //         admin.database().ref('/').update(allMultipathData, function (error) {
    //             if (error) {
    //                 response.send("Error updating data:", error);
    //             }
    //             response.send('User added to chat successfully.... ')
    //         });
    //     });
    // })
    // response.send(JSON.stringify(userIds))
});
exports.removeUserFromChat = functions.https.onRequest((request, response) => {
    const userId = request.query.userId;
    const chatId = request.query.chatId;

    // response.send('UserId ' + userId + ' chatId: ' + chatId)
    var allMultipathData = {} // Helps to update in batch 

    allMultipathData["/chatList/" + chatId + "/memberStatus/" + userId] = false
    // Remove from userConnection
    allMultipathData["/userConnection/" + userId + "/" + chatId] = null

    admin.database().ref('/').update(allMultipathData, function (error) {
        if (error) {
            console.log("Error updating data:", error);
        }
        response.send('User removed from chat successfully.... ')
    });
});
exports.deleteUser = functions.https.onRequest((request, response) => {
    const userId = request.query.userId;

    printConsole('userId: ' + userId);
    // const chatId = request.query.chatId;
    // const allUser = request.query.accept;


    // Get all the information about for user's connection and make create a path for chatList
    const userConenctionPromise = admin.database().ref('/userConnection/' + userId).once('value');

    Promise.all([userConenctionPromise]).then(values => {
        printConsole('Getting all connection');
        // var allMultipathData = {} // Helps to update in batch 
        const userConenction = values[0]; // Get user's userConnection dataπ
        printConsole('Coming for userConenction : ' + userConenction);

        var path = []
        userConenction.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            printConsole('Coming for key: ' + key);
            var getChatData = admin.database().ref('/chatList/' + key).once('value');
            printConsole('Coming for getChatData: ' + getChatData);
            path.push(getChatData)
        })
        printConsole('Coming for 2: ' + JSON.stringify(path));
        Promise.all(path).then(allChat => {
            printConsole('Coming for 3: ');
            var allMultipathData = {} // Helps to update in batch 
            // let chatId = request.query.chatId
            for (var i = 0; i < allChat.length; i++) {
                var key = allChat[i].key;
                let chatInfo = allChat[i].val()
                if (chatInfo.chatTypeId === 1) {
                    let allKeys = Object.keys(chatInfo.allMembers)
                    for (var i = 0; i < allKeys.length; i++) {
                        let current_user_id = allKeys[i]
                        allMultipathData["/userConnection/" + current_user_id + "/" + key] = null
                    }
                    allMultipathData["/chatList/" + key] = null
                } else {
                    // Set status for chatlist
                    allMultipathData["/chatList/" + key + "/allMembers/" + userId + "/deviceToken"] = null
                    allMultipathData["/chatList/" + key + "/memberStatus/" + userId] = false
                    // Remove from userConnection
                    allMultipathData["/userConnection/" + userId + "/" + key] = null
                }
            }

            allMultipathData["/users/" + userId] = null
            // response.send(JSON.stringify(allMultipathData))
            printConsole('Coming for Final Step');

            admin.database().ref('/').update(allMultipathData, function (error) {
                if (error) {
                    response.send("Error updating data:", error);
                }
                response.send('User deleted from chat successfully.... ')
            });
        });
        // userConenction.forEach(function (childSnapshot) {
        //     var key = childSnapshot.key;
        //     var value = childSnapshot.val();

        //     // Set status for chatlist
        //     allMultipathData["/chatList/" + key + "/allMembers/" + userId + "/deviceToken"] = null
        //     allMultipathData["/chatList/" + key + "/memberStatus/" + userId] = false
        //     // Remove from userConnection
        //     allMultipathData["/userConnection/" + userId + "/" + key] = null

        //     // // If its one to one chat then we need to remove from both user
        //     // printConsole(value.chatTypeId)

        // if (value.chatTypeId === 1) {

        //     let allKeys = Object.keys(value.allMembers)

        //     printConsole(JSON.stringify(allKeys))

        //     for (var i = 0; i < allKeys.length; i++) {
        //         let current_user_id = allKeys[i]
        //         allMultipathData["/userConnection/" + current_user_id + "/" + key] = null
        //     }
        //     allMultipathData["/chatList/" + key] = null
        // } else {
        //     // Set status for chatlist
        //     allMultipathData["/chatList/" + key + "/allMembers/" + userId + "/deviceToken"] = null
        //     allMultipathData["/chatList/" + key + "/memberStatus/" + userId] = false
        //     // Remove from userConnection
        //     allMultipathData["/userConnection/" + userId + "/" + key] = null
        // }
        // });

        // Remove main user data
        // allMultipathData["/users/" + userId] = null

        // admin.database().ref('/').update(allMultipathData, function (error) {
        //     if (error) {
        //         console.log("Error updating data:", error);
        //     }
        //     response.send('User deleted successfully.... ')
        // });
    });

});
exports.localCheckFunction = functions.https.onRequest((request, response) => {
    const getUnreadCountPromise = admin.database().ref('/userConnection/5b0fff21-fe75-e811-80c3-0003ff6d7265').once('value');
    printConsole('Calling for Unread Count ====>>>');
    // getUnreadCountPromise.then((snapshot) => {
    Promise.all([getUnreadCountPromise]).then(values => {
        let unreadCountObject = values[0].val()
        let unreadCount = 0;

        let allKeys = Object.keys(unreadCountObject)
        for (var i = 0; i < allKeys.length; i++) {
            let key = allKeys[i]
            printConsole('Key: ' + key)
            let c = unreadCountObject[key]
            printConsole('Value: ' + JSON.stringify(c))
            unreadCount = unreadCount + c
        }
        // unreadCountObject.forEach(function (value) {
        //     let count = value.val();
        //     unreadCount = unreadCount + count
        // });
        printConsole('UnreadCount: ' + unreadCount);
    });
})

// This function will call every time when anything will update in users node.
// It will take a latest value from user section and update every where at user is there
exports.onUserUpdate = functions.database.ref('/users/{userId}').onWrite((change, context) => {
    // Exit when the data is deleted.
    if (!change.after.exists()) {
        return null;
    }
    // Getting userId for whom which is updating his/her profile
    const userId = context.params.userId;
    const afterData = change.after.val(); // New updated data which needs to update

    //Create a local object for update
    let objUser = {};
    if (afterData.firstName) {
        objUser.firstName = afterData.firstName
    }
    if (afterData.lastName) {
        objUser.lastName = afterData.lastName
    }
    if (afterData.profilePic) {
        objUser.profilePic = afterData.profilePic
    }
    if (afterData.firstName) {
        objUser.firstName = afterData.firstName
    }

    // objUser.lastName = afterData.lastName
    // objUser.profilePic = afterData.profilePic
    objUser.userId = userId
    // Also check if deviceToken is available then add into static array, so it will be update
    if (afterData.deviceToken) {
        objUser.deviceToken = afterData.deviceToken
    } else {
        objUser.deviceToken = null; // need to remove the device token if its not there
    }

    // Set false into chatList in onlineMembers
    let userOnlineStatus = true
    userOnlineStatus = afterData.status

    // Need to check for available flage
    if (afterData.isAvailable === false) {
        userOnlineStatus = false
    }

    printConsole('User Status userId: ' + userId)
    // Call a function to update the data
    processUser(userId, objUser, userOnlineStatus, afterData.isAvailable)
});

// This function is used to update the user information in chatList node. 
// It will get information from userConnection and make necessary changes.
function processUser(userId, userData, userOnlineStatus, isAvailable) {

    // Get all the information about for user's connection and make create a path for chatList
    const userConenctionPromise = admin.database().ref('/userConnection/' + userId).once('value');

    Promise.all([userConenctionPromise]).then(values => {
        var allMultipathData = {} // Helps to update in batch 
        const userConenction = values[0]; // Get user's userConnection dataπ

        userConenction.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var value = childSnapshot.val();

            // printConsole('Keys: ' + key)
            // printConsole('value: ' + value)
            allMultipathData["/chatList/" + key + "/allMembers/" + userId] = userData

            if (userOnlineStatus === false) {
                allMultipathData["/chatList/" + key + "/onlineMembers/" + userId] = userOnlineStatus
            }

            // Update the memberStatus
            allMultipathData["/chatList/" + key + "/memberStatus/" + userId] = isAvailable

            // make user online status for particular chat list
            allMultipathData["/chatList/" + key + "/onlineMembersSystem/" + userId] = userOnlineStatus

        });

        admin.database().ref('/').update(allMultipathData, function (error) {
            if (error) {
                printConsole("Error updating data:", error);
            } else {
                printConsole('Updated')
            }
            return 'User information is updated successfully';
        });
    }).catch(function (error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
        // ADD THIS THROW error
        throw error;
    });;
}

function printConsole(text) {
    console.log(text)
}
exports.onUpdateCount = functions.database.ref('/converstionData/{chatId}/{detailChatId}').onWrite((data, context) => {
    printConsole('onUpdateCountParse ==> Update')
    var chatId = context.params.chatId;

    // Here we got the last object for message and it will decrypted
    let lastObject = data.after.val();
    let isSystemMessage = false;
    if (lastObject.isSystemMessage !== undefined) {
        isSystemMessage = true;
    } else {
        var bytes = CryptoJS.AES.decrypt(lastObject.text, SECRET_KEY);
        lastObject.text = bytes.toString(CryptoJS.enc.Utf8);
    }


    const userId = lastObject.userId;

    // Here need to get the data for chat id and then need to send the push notification.
    const chatListPromise = admin.database().ref('/chatList/' + chatId).once('value');
    Promise.all([chatListPromise]).then(values => {
        // const chatListObject = values[0]; // Get chat list object

        let chatListObject = values[0].val()
        let isOneToOne = false;


        let allOnlineMember = chatListObject.onlineMembers;
        let allKeysOnline = Object.keys(allOnlineMember);

        let allMemberStatus = chatListObject.memberStatus;
        let length = allKeysOnline.length;
        printConsole('Length is ' + length)

        let id = chatListObject.lastMessage.userId;

        let senderInfo = chatListObject.allMembers[id];
        printConsole('senderID is ' + id)
        printConsole('senderInfo is ' + JSON.stringify(senderInfo))
        let userName = '';
        let title = '';
        if (senderInfo.firstName) {
            title = senderInfo.firstName
            userName = senderInfo.firstName;
        }


        // Check if current chat is one-one or group
        if (chatListObject.chatTypeId === 1) {
            isOneToOne = true;
        } else {
            title = chatListObject.name
        }


        // let finalArrayList = [];
        for (var i = 0; i < length; i++) {
            let currentUserId = allKeysOnline[i]
            printConsole('currentUserId.... ' + currentUserId)
            if (currentUserId) {
                if (currentUserId !== id) {
                    // Get user status
                    let isOnline = allOnlineMember[currentUserId]
                    let isMember = allMemberStatus[currentUserId]
                    printConsole('isOnline.... ' + isOnline)
                    printConsole('isMember.... ' + isMember)

                    //Check if user is offline and his/her statu is active.
                    if (isOnline === false && isMember === true) {

                        printConsole('Member is not online.... ' + currentUserId)
                        // User is found..... Good to go for push 
                        // Check for device token he has and send just fire....

                        // Get device token from chatList
                        // If current user is having a device token then send notification to all the device token...

                        if (chatListObject.allMembers[currentUserId].deviceToken) {
                            const allDeviceToken = chatListObject.allMembers[currentUserId].deviceToken;
                            let allTokens = Object.keys(allDeviceToken); // All the token for notification
                            printConsole('All Device Token.... ' + JSON.stringify(allDeviceToken));
                            if (allTokens.length > 0) {
                                // Get user's unread count
                                const getUnreadCountPromise = admin.database().ref('/userConnection/' + currentUserId).once('value');
                                printConsole('Calling for Unread Count');
                                // getUnreadCountPromise.then((snapshot) => {
                                Promise.all([getUnreadCountPromise]).then(values => {

                                    let unreadCountObject = values[0].val()
                                    let unreadCount = 0;

                                    // unreadCountObject.forEach(function (childSnapshot) {
                                    //     var value = childSnapshot.val();
                                    //     unreadCount = unreadCount + value
                                    // });
                                    let allKeys = Object.keys(unreadCountObject)
                                    for (var i = 0; i < allKeys.length; i++) {
                                        let key = allKeys[i]
                                        let c = unreadCountObject[key]
                                        unreadCount = unreadCount + c
                                    }

                                    printConsole('UnreadCount: ' + unreadCount);
                                    const data = {
                                        userId: `${id}`,
                                        chatId: `${chatId}`,
                                        type: '202',
                                    };
                                    let body = lastObject.text;
                                    if (isOneToOne === false && isSystemMessage === false) {
                                        body = userName + ': ' + lastObject.text
                                    }
                                    printConsole('Need to send notification....')

                                    for (var i = 0; i < allTokens.length; i++) {
                                        const token = allTokens[i];
                                        printConsole('Got the notification and send on it.... ' + token)
                                        sendPush(token, title, body, data, userId, admin, unreadCount.toString())
                                    }
                                });
                            }
                        }
                    }
                }
            }
            // Need to send notification other than sender

        }
        printConsole('Done');
    });
});




function sendPush(registrationToken, title, body, data, userId, admin, badgeCount) {

    console.log('sendPush....')
    var notification = {
        title: title,
        body: body,
        sound: "default",
        badge: badgeCount,
        show_in_foreground: 'true',
        priority: 'high',

    };
    var payload = {
        data: data,
        notification: notification,
    };
    // var registrationToken = 'RKaRvM:APA91bEl0I2BNp3PWAdwNUVQLOdfAQODteMB7kzKZPddhkNsKHPUkuQhOdeyzUiwMyW3WLaPzo9vIBsCeoRJIaMFNVIqxPMn5PUtcK1onxnNmxr-sbn4tzh4lR9I9vWn--DavCVnf3Qbh-OhO0cEYk0NXM4UU-RDKg';
    sendNotificationByToken(payload, registrationToken, admin);


    // if (settings != null && settings != undefined && settings.val() !== null && settings.val() !== undefined) {

    //     const config = type === NOTIFICATION_WANNA ?
    //         settings.val().wanna : settings.val().chat;
    //     if (config.notification) {
    //         var registrationToken = settings.val().token;
    //         var notification = null;
    //         if (config.sound) {
    //             notification = {
    //                 title: title,
    //                 body: body,
    //                 sound: config.sound ? "default" : null,
    //                 badge: badgeCount,

    //             };
    //         } else {
    //             notification = {
    //                 title: title,
    //                 body: body,
    //                 badge: badgeCount,
    //             };
    //         }

    //         var payload = {
    //             data: data,
    //             notification: notification,
    //         };

    //         sendNotificationByToken(payload, registrationToken, admin);
    //     } else {
    //         console.log("notification off for  " + userId);
    //     }
    // }
}

// function sendAndroidPush(settings, title, body, data, userId, admin, type) {
//     if (settings != null && settings != undefined && settings.val() !== null && settings.val() !== undefined) {
//         const config = type === NOTIFICATION_WANNA ?
//             settings.val().wanna : settings.val().chat;
//         if (config != null && config.notification) {
//             var registrationToken = settings.val().token;
//             data.title = title;
//             data.body = body;
//             if (config.sound) {
//                 data.sound = config.sound ? "default" : null;
//             }
//             var payload = {
//                 data: data,
//             };
//             sendNotificationByToken(payload, registrationToken, admin);
//         } else {
//             console.log("notification off for  " + userId);
//         }
//     }
// }

function sendNotificationByToken(payload, registrationToken, admin) {
    console.log('sendNotificationByToken....')
    if (registrationToken !== null && registrationToken !== undefined) {
        console.log(payload);
        var options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };

        admin.messaging().sendToDevice(registrationToken, payload, options)
            .then(function (res) {
                // See the MessagingDevicesResponse reference documentation for
                // the contents of response.
                console.log("Successfully sent message:", res);
                //   response.send("Successfully sent message:"+ res);
            })
            .catch(function (error) {
                console.log("Error sending message:", error);
                //   response.send("Error sending message:"+ error);
            });
    } else {
        console.log("token empty");
    }
}

