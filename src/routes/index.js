import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import tripsRoutes from './trips.routes.js'
import bookingsRoutes from './bookings.routes.js'
import expensesRoutes from './expenses.routes.js'
import advancesRoutes from './advances.routes.js'
import walletRoutes from './wallet.routes.js'
import notificationsRoutes from './notifications.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import wishlistRoutes from './wishlist.routes.js'
import savedFlightsRoutes from './savedFlights.routes.js'
import offersRoutes from './offers.routes.js'
import flightsRoutes from './flights.routes.js'

const router = Router()

// Health checks are unversioned and unauthenticated — infra needs to
// reach these regardless of API version or auth state.
router.use('/health', healthRoutes)

const v1 = Router()
v1.use('/auth', authRoutes)
v1.use('/trips', tripsRoutes)
v1.use('/bookings', bookingsRoutes)
v1.use('/expenses', expensesRoutes)
v1.use('/advances', advancesRoutes)
v1.use('/wallet', walletRoutes)
v1.use('/notifications', notificationsRoutes)
v1.use('/dashboard', dashboardRoutes)
v1.use('/wishlist', wishlistRoutes)
v1.use('/saved-flights', savedFlightsRoutes)
v1.use('/offers', offersRoutes)
v1.use('/flights', flightsRoutes)

router.use('/api/v1', v1)

export default router
