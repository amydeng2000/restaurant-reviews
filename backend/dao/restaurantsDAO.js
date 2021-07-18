let restaurants

export default class RestaurantsDAO {
  // when server starts, connect to db
  static async injectDB(conn) {
    if (restaurants) {
      return
    }
    try {
      restaurants = await conn
        .db(process.env.RESTREVIEWS_NS)
        .collection('restaurants')
    } catch (e) {
      console.error('Unable to establish a collection')
    }
  }

  static async getRestaurants({
    filters = null,
    page = 0,
    restaurantsPerPage = 20,
  } = {}) {
    let query //  construct MongoDB query
    if (filters) {
      if ('name' in filters) {
        query = { $text: { $search: filters['name'] } } // in MongoDB, set up which field to search
      } else if ('cuisine' in filters) {
        query = { cuisine: { $eq: filters['cuisine'] } }
      } else if ('zipcode' in filters) {
        query = { 'address.zipcode': { $eq: filters['zipcode'] } }
      }
    }

    let cursor // query result
    try {
      cursor = await restaurants.find(query)
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }

    const displayCursor = cursor
      .limit(restaurantsPerPage)
      .skip(restaurantsPerPage * page)

    try {
      // convert query to list and return
      const restaurantsList = await displayCursor.toArray()
      const totalNumRestaurants = await restaurants.countDocuments(query)
      return { restaurantsList, totalNumRestaurants }
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`,
      )
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }
  }
}
