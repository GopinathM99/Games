import unittest
from my_package.main import main

class TestMain(unittest.TestCase):
    def test_main(self):
        self.assertEqual(main(), None)  # Adjust based on actual output

if __name__ == "__main__":
    unittest.main()
