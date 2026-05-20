import fs from 'fs'
import path from 'path'

const DETAIL_EVENT_TYPES = new Set(['browserRouteNavigationTracker', 'backendApiCallsTracker'])

const formatDetails = (event) => {
    if (!DETAIL_EVENT_TYPES.has(event.eventType) || !event.details) {
        return ''
    }

    return ` | details:${JSON.stringify(event.details)}`
}

const formatJson = (value) => JSON.stringify(value, null, 2)

const indentBlock = (value) => formatJson(value)
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')

const formatEvent = (event) => {
    const time   = new Date().toISOString()
    const type   = String(event.eventType ?? '').padEnd(12)
    const page   = String(event.pageName ?? '').padEnd(25)
    const target = String(event.target ?? '').padEnd(30)
    const user   = String(event.userName ?? 'anonymous').padEnd(15)
    const summary = `[${time}] ${type} | ${page} | ${target} | user:${user}`

    if (event.eventType !== 'backendApiCallsTracker' || !event.details) {
        return `${summary}${formatDetails(event)}`
    }

    const { request, response, error, durationMs, outcome } = event.details
    const detailLines = [
        summary,
        `  outcome: ${outcome ?? ''}`,
        `  durationMs: ${durationMs ?? ''}`,
        '  request:',
        indentBlock(request ?? {}),
    ]

    if (response !== undefined) {
        detailLines.push('  response:', indentBlock(response))
    }

    if (error !== undefined) {
        detailLines.push(`  error: ${error}`)
    }

    return detailLines.join('\n')
}

/**
 * Vite dev server plugin — receives log events from the browser
 * and writes them to logs/ui-events.log in the project root.
 *
 * Endpoint: POST /__dev_log__
 * Body: { events: TrackingEvent[] }
 *
 * Only active in dev mode (vite dev server).
 * In prod this endpoint doesn't exist — eventQueue uses /events/batches instead.
 */
export function devLogPlugin() {
    const logDir  = path.resolve(process.cwd(), 'logs')
    const logFile = path.join(logDir, 'ui-events.log')

    return {
        name: 'dev-log-plugin',

        configureServer(server) {
            // Ensure logs/ directory exists
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true })
            }

            if (!fs.existsSync(logFile)) {
                fs.writeFileSync(logFile, '', 'utf8')
            }

            server.middlewares.use('/__dev_log__', (req, res) => {
                if (req.method !== 'POST') {
                    res.statusCode = 405
                    res.end('Method Not Allowed')
                    return
                }

                let body = ''
                req.on('data', (chunk) => { body += chunk.toString() })
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body)
                        const events  = payload.events ?? []

                        // Write each event as a formatted log line
                        const lines = events.map(formatEvent)

                        if (lines.length > 0) {
                            fs.appendFileSync(logFile, lines.join('\n') + '\n', 'utf8')
                        }

                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({ message: 'Events saved' }))
                    } catch (err) {
                        console.error(err)
                        res.statusCode = 400
                        res.end('Bad Request')
                    }
                })
            })

            console.log(`\n  📋 Dev event logger active → ${logFile}\n`)
        },
    }
}
