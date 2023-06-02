import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import database from '@react-native-firebase/database';

const ChatScreen = ({ route }: any) => {
  const { chatData, currentUser } = route.params;
  const [messages, setMessages] = useState<{ id: number; sender: string; message: string; }[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const snapshot = await database().ref(`chats/${chatData.id}/messages`).once('value');
        const messagesData = snapshot.val();

        if (messagesData) {
          const messagesArray = Object.keys(messagesData).map((key) => ({
            id: Number(key),
            sender: messagesData[key].sender,
            message: messagesData[key].message,
          }));

          setMessages(messagesArray);
        }
      } catch (error) {
        console.log('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [chatData.id]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      return;
    }

    try {
      const newMessageRef = database().ref(`chats/${chatData.id}/messages`).push();
      await newMessageRef.set({
        sender: currentUser,
        message: newMessage,
      });

      setNewMessage('');
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  const renderMessageItem = ({ item }: any) => (
    <View style={styles.messageItem}>
      <Text style={styles.messageSender}>{item.sender}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{chatData.seller}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessageItem}
        style={styles.messageList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  messageList: {
    flex: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  messageItem: {
    padding: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#3f51b5',
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
