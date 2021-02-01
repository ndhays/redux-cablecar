import CableCarRoute from './cableCarRoute'

/* CableCarDispatcher Class */
export default class CableCarDispatcher {
    consumers: { [wsUrl: string]: any } = {}

    consumerFor(route: CableCarRoute) {
        const key = route.webSocketURL || 'default'
        if (!this.consumers[key]) {
            const consumer = route.provider.createConsumer(route.webSocketURL)
            this.consumers[key] = consumer
        }
        return this.consumers[key]
    }
}
