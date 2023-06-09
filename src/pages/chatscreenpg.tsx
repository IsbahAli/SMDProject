import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const ChatScreen = ({ route }: any) => {
  const { chatData, bidMsg } = route.params;
  const { senderId, receiverId, receiverName, senderName } = chatData;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Reference to the chat node in Firebase Realtime Database
  const chatRef = database().ref('chats');
  const currentUser = auth().currentUser;
  const currentUserId = currentUser?.uid || '';

  // Function to save a message in the chat history
  const saveMessage = async (
    senderId: string,
    receiverId: string,
    message: string,
    senderName: string,
    receiverName: string
  ) => {
    try {
      await chatRef.push().set({
        senderId,
        receiverId,
        message,
        senderName,
        receiverName,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.log('Error saving message:', error);
    }
  };

  // Function to load the chat history for the current user
  const loadChatHistory = async (userId: string, sellerId: string) => {
    try {
      console.log('Loading chat history...');
      chatRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
          const chatData = snapshot.val();

          const userChatData = Object.values(chatData).filter(
            (message: any) =>
              (message.senderId === userId && message.receiverId === sellerId) ||
              (message.senderId === sellerId && message.receiverId === userId)
          );

          const sortedMessages = userChatData.sort((a: any, b: any) => a.timestamp - b.timestamp);

          const loadedMessages = sortedMessages.map((message: any) => ({
            id: message.timestamp.toString(),
            message: message.message,
            senderId: message.senderId,
          }));

          setMessages(loadedMessages);
        }
      });
    } catch (error) {
      console.log('Error loading chat history:', error);
    }
  };

  useEffect(() => {
    // Load the chat history for the current user
    loadChatHistory(senderId, receiverId);

    // Check if bidMsg is not null and automatically send the message
    if (bidMsg) {
      console.log('bid', bidMsg);
      handleSendMessage(bidMsg);
    }

    // Cleanup the chat listener when the component is unmounted
    return () => {
      chatRef.off();
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the ScrollView when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = (msg: string) => {
    let finalMessage = msg;
    if (finalMessage.trim() !== '') {
      const isCurrentUserSender = senderId === currentUserId;

      if (isCurrentUserSender) {
        saveMessage(senderId, receiverId, finalMessage, senderName, receiverName);
      } else {
        saveMessage(receiverId, senderId, finalMessage, receiverName, senderName);
      }
      console.log('msf', finalMessage);

      // Clear the input field
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{senderName}</Text>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContentContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((item) => (
          <View
            key={item.id}
            style={
              item.senderId === senderId
                ? styles.sentMessageContainer
                : styles.receivedMessageContainer
            }
          >
            <Text style={styles.message}>{item.message}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage(message)}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1CB48C',
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  receivedMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  sentMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1CB48C',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
});

export default ChatScreen;
