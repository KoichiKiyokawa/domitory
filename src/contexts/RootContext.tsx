import React from 'react'
import { IMessage } from 'react-native-gifted-chat'

import { db } from '../plugins/firebase'

interface IContext {
  user: IUser
  setUser: (arg: IUser) => void

  messages: IMessage[]
  setMessages: (arg: IMessage[]) => void

  notices: INotice[]
  setNotices: (arg: INotice[]) => void

  mealOrders: IMealOrder[]
  setMealOrders: (arg: IMealOrder[]) => void
}

export const RootContext = React.createContext<Partial<IContext>>(null)

export const RootProvider: React.FC = ({ children }) => {
  const [user, setUser] = React.useState<IUser>({
    roomNumber: 0,
    name: '管理人',
    id: 0,
    isManager: true
  })

  // チャットのメッセージ
  const [messages, setMessages] = React.useState<IMessage[]>([])

  // お知らせ
  const [notices, setNotices] = React.useState<INotice[]>([])

  // 食事の申込み一覧
  const [mealOrders, setMealOrders] = React.useState<IMealOrder[]>([])

  // メッセージの取得
  React.useEffect(() => {
    const unsubscribe = db
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        setMessages(
          querySnapshot.docs.map(doc => {
            const messageData = doc.data()
            return {
              ...messageData,
              _id: doc.id,
              createdAt: messageData.createdAt.toDate()
            } as IMessage
          })
        )
      })

    return () => unsubscribe()
  }, [])

  // 食事の申込み
  React.useEffect(() => {
    const unsubscribe = db
      .collection('mealOrders')
      .doc('trusty')
      .onSnapshot(documentSnapshot => {
        setMealOrders(documentSnapshot.data().weeklyOrder as IMealOrder[])
      })
  })

  return (
    <RootContext.Provider
      value={{
        user,
        setUser,
        messages,
        setMessages,
        notices,
        setNotices,
        mealOrders,
        setMealOrders
      }}
    >
      {children}
    </RootContext.Provider>
  )
}
