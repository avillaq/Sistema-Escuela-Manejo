import { Outlet } from "react-router";
export const Layout = () => {
  return (
    <div className="layout-wrapper">
      <header className="header-container">
        <div>NavBar</div>
      </header>
      <main className='main-container'>
          <Outlet />
      </main>
      <div>Footer</div>
    </div>
  )
}
