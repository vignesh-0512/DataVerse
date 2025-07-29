import unittest
from app import app
from unittest.mock import patch,MagicMock


class FlaskAppTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    @patch('app.collection.find')
    def test_getAll_data(self,mock_find):
        mock_find.return_value = [{"topic":"Economy", "intensity":10}]
        response = self.client.get('/api/data')
        self.assertEqual(response.status_code,200)
        self.assertIsInstance(response.get_json(),list)
    
    @patch('app.collection.data')
    def test_api_endpoints(self,mock_find):
        mock_find.return_value=[{"region":"World","intensity":12}]
        response = self.client.get('/api/filter?region=World')
        self.assertEqual(response.status_code,200)
        self.assertTrue(any(item['region'] == 'World' for item in response.get_json()))

if __name__ == '__main__':
    unittest.main()
