import { Outlet } from "react-router";
export const Layout = () => {
  return (
    <div className="layout-wrapper">
      <main className='main-container'>
          <Outlet />
      </main>
    </div>
  )
}
