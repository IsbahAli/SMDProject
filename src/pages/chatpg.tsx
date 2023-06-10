import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

interface ChatData {
  id: string;
  receiverId: string;
  senderId: string;
  senderName: string;
  receiverName: string;
}

const ChatPage = ({ navigation }: any) => {
  const [chats, setChats] = useState<ChatData[]>([]);

  // Reference to the chat node in Firebase Realtime Database
  const chatRef = database().ref('chats');
  const currentUser = auth().currentUser;
  const currentUserId = currentUser?.uid || '';

  useEffect(() => {
    const loadChats = async () => {
        try {
          // Retrieve the chats from the chat node where the current user is the receiver
          chatRef
            .orderByChild('receiverId')
            .equalTo(currentUserId)
            .on('value', snapshot => {
              if (snapshot.exists()) {
                const chatData = snapshot.val();
      
                // Filter out duplicate chats where the sender and receiver are the same
                const filteredChats = Object.values(chatData).filter(
                  (chat: any) => chat.senderId !== chat.receiverId
                );
      
                // Get unique senderIds
                const uniqueSenderIds = Array.from(new Set(filteredChats.map((chat: any) => chat.senderId)));
      
                // Map the filtered and unique chat data to chats
                const loadedChats: ChatData[] = uniqueSenderIds.map((senderId: string) => {
                  const chat: any = filteredChats.find((chat: any) => chat.senderId === senderId);
                  return {
                    id: chat.id,
                    senderId: chat.senderId,
                    senderName: chat.senderName,
                    receiverId: chat.receiverId,
                    receiverName: chat.receiverName,
                  };
                });
      
                // Update the chats state with the retrieved chats
                setChats(loadedChats);
              } else {
                // If there are no chats, set the chats state to an empty array
                setChats([]);
              }
            });
        } catch (error) {
          console.log('Error loading chats:', error);
        }
      };
      
    loadChats();

    // Cleanup the chat listener when the component is unmounted
    return () => {
      chatRef.off();
    };
  }, []);

  const handleChatItemClick = (chatData: ChatData) => {
    // Navigate to the chat screen and pass the chat data
    navigation.navigate('ChatScreen', {
      chatData,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleChatItemClick(item)}
            >
            <Text style={styles.chatItemText}>
                {item.senderId === currentUserId ? item.receiverName : item.senderName}
            </Text>
            </TouchableOpacity>
        )}
        />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1cb48c',
    padding: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chatItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  chatItemText: {
    fontSize: 16,
  },
});

export default ChatPage;
