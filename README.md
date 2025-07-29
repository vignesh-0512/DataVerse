
A Python Flask API that provides access to data stored in MongoDB with support for filtering and rate limiting.

---

## ✅ Features

- **Retrieve all data** from the MongoDB collection  
  🔗 Endpoint: `http://127.0.0.1:5000/api/data`

- **Filter data** based on query parameters such as region, country, topic, etc.  
  🔗 Endpoint: `http://127.0.0.1:5000/api/filter`

- **Rate Limiting**: Utilized `flask_limiter` to prevent abuse and mitigate attacks such as DDoS.

- **Secure Configuration**: MongoDB credentials and environment variables are stored in a `.env` file to keep sensitive data out of the codebase.

- **CORS Support**: Enabled Cross-Origin Resource Sharing using `Flask-CORS` to allow secure communication between the frontend and backend.

---

## 🧪 Testing

- Unit tests have been written to verify the functionality of each endpoint.
- The tests ensure that the `/api/data` and `/api/filter` endpoints return correct and expected results.

