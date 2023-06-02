import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import database from '@react-native-firebase/database';

const ChatPage = ({ navigation }: any) => {
  const [sellerChats, setSellerChats] = useState<{ id: number; seller: string; message: string; }[]>([]);
  const [buyerChats, setBuyerChats] = useState<{ id: number; buyer: string; message: string; }[]>([]);

  useEffect(() => {
    const fetchSellerChats = async () => {
      try {
        const snapshot = await database().ref('sellerChats').once('value');
        const chatsData = snapshot.val();

        if (chatsData) {
          const chatsArray = Object.keys(chatsData).map((key) => ({
            id: Number(key),
            seller: chatsData[key].seller,
            message: chatsData[key].message,
          }));

          setSellerChats(chatsArray);
        }
      } catch (error) {
        console.log('Error fetching seller chats:', error);
      }
    };

    const fetchBuyerChats = async () => {
      try {
        const snapshot = await database().ref('buyerChats').once('value');
        const chatsData = snapshot.val();

        if (chatsData) {
          const chatsArray = Object.keys(chatsData).map((key) => ({
            id: Number(key),
            buyer: chatsData[key].buyer,
            message: chatsData[key].message,
          }));

          setBuyerChats(chatsArray);
        }
      } catch (error) {
        console.log('Error fetching buyer chats:', error);
      }
    };

    fetchSellerChats();
    fetchBuyerChats();
  }, []);

  const renderSellerChatItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatScreen', { chatData: item, currentUser: 'current_user_id' })}
    >
      <Text style={styles.chatUser}>{item.seller}</Text>
      <Text style={styles.chatMessage}>{item.message}</Text>
    </TouchableOpacity>
  );

  const renderBuyerChatItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatScreen', { chatData: item, currentUser: 'current_user_id' })}
    >
      <Text style={styles.chatUser}>{item.buyer}</Text>
      <Text style={styles.chatMessage}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <Text style={styles.tab}>Seller Chats</Text>
      {sellerChats.length > 0 ? (
        <FlatList
          data={sellerChats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSellerChatItem}
          style={styles.chatList}
        />
      ) : (
        <Text style={styles.noChatsText}>No seller chats yet.</Text>
      )}

      <Text style={styles.tab}>Buyer Chats</Text>
      {buyerChats.length > 0 ? (
        <FlatList
          data={buyerChats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBuyerChatItem}
          style={styles.chatList}
        />
      ) : (
        <Text style={styles.noChatsText}>No buyer chats yet.</Text>
      )}
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
  tab: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  chatUser: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chatMessage: {
    fontSize: 14,
    color: '#666666',
  },
  noChatsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default ChatPage;
