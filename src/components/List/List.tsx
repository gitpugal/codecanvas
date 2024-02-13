import React, { FC, ReactNode } from 'react'
interface Props{
    children : ReactNode | ReactNode[]
    }
const List : FC<Props> = ({children}) => {
  return (
    <ul>
        <li>123123123</li>
        <li>{children}</li>
        <li>456456456</li>
    </ul>
  )
}

export default List