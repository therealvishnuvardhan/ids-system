import type { ReactNode } from "react"
import Pattern from "./Pattern"
import styled from "styled-components"

const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 2rem 1.5rem 4rem;
`

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

type UserPageLayoutProps = {
  children: ReactNode
}

function UserPageLayout({ children }: UserPageLayoutProps) {
  return (
    <>
      <Pattern />
      <Wrapper>
        <Content>{children}</Content>
      </Wrapper>
    </>
  )
}

export default UserPageLayout
