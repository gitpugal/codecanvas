import React, { FC, ReactNode } from 'react'

interface Props{
children : ReactNode | ReactNode[]
}
const Head2 : FC<Props> = ({children}) => {
  return (
    // <button>{children}</button>
    <h2>{children}</h2>
  )
}

export default Head2