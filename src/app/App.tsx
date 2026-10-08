import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Course from '../pages/Course'
import { SettingsProvider } from './SettingsProvider'

const Playground = lazy(() => import('../pages/Playground'))

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <Routes>
          <Route path="/" element={<Course />} />
          <Route
            path="/playground"
            element={
              <Suspense fallback={<div className="h-dvh bg-bg" />}>
                <Playground />
              </Suspense>
            }
          />
          <Route path="*" element={<Course />} />
        </Routes>
      </SettingsProvider>
    </BrowserRouter>
  )
}
