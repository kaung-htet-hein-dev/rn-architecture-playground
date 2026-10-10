import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { SettingsProvider } from './app/SettingsProvider'
import Course from './pages/Course'

/** Static HTML of the course for crawlers; the client replaces it on load. */
export function render(): string {
  return renderToString(
    <StaticRouter location="/">
      <SettingsProvider>
        <Course />
      </SettingsProvider>
    </StaticRouter>,
  )
}
