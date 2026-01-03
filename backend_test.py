import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class BalanceAPITester:
    def __init__(self, base_url="https://gestione-imprese.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
            self.failed_tests.append({"test": test_name, "error": details})

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json() if response.content else {}
                    self.log_result(name, True)
                    return True, response_data
                except:
                    self.log_result(name, True)
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_result(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False, {}

    def setup_test_session(self):
        """Create test user and session in MongoDB"""
        print("🔧 Setting up test session...")
        
        # Generate test data
        timestamp = int(datetime.now().timestamp())
        self.user_id = f"test-user-{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        test_email = f"test.user.{timestamp}@example.com"
        
        # MongoDB commands to create test user and session
        mongo_commands = f"""
use('test_database');
db.users.insertOne({{
  user_id: '{self.user_id}',
  email: '{test_email}',
  name: 'Test User Balance',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date(),
  subscription_tier: 'free'
}});
db.user_sessions.insertOne({{
  user_id: '{self.user_id}',
  session_token: '{self.session_token}',
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
print('Test session created successfully');
"""
        
        try:
            import subprocess
            result = subprocess.run(['mongosh', '--eval', mongo_commands], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print(f"✅ Test session created - User ID: {self.user_id}")
                print(f"✅ Session token: {self.session_token}")
                return True
            else:
                print(f"❌ Failed to create test session: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ MongoDB setup failed: {str(e)}")
            return False

    def test_auth_flow(self):
        """Test authentication endpoints"""
        print("\n📋 Testing Authentication...")
        
        # Test /auth/me with valid session
        success, data = self.run_test(
            "Auth - Get current user",
            "GET",
            "auth/me",
            200
        )
        
        if success and data.get('user', {}).get('user_id') == self.user_id:
            print(f"✅ User authenticated: {data['user']['name']}")
            return True
        else:
            print("❌ Authentication failed")
            return False

    def test_onboarding(self):
        """Test onboarding flow"""
        print("\n📋 Testing Onboarding...")
        
        # Complete onboarding
        onboarding_data = {
            "tipo_attivita": "Negozio",
            "settore": "Alimentare", 
            "obiettivi": ["Controllo entrate", "Controllo costi"]
        }
        
        success, data = self.run_test(
            "Onboarding - Complete profile",
            "POST",
            "onboarding",
            200,
            onboarding_data
        )
        
        if success:
            # Test get profile
            success2, profile = self.run_test(
                "Onboarding - Get profile",
                "GET",
                "profile",
                200
            )
            return success and success2
        
        return False

    def test_costi_management(self):
        """Test costs management"""
        print("\n📋 Testing Costs Management...")
        
        # Test fixed costs
        costo_fisso = {
            "descrizione": "Affitto locale test",
            "importo_mensile": 1200.00
        }
        
        success1, fisso_data = self.run_test(
            "Costi - Add fixed cost",
            "POST",
            "costi/fissi",
            200,
            costo_fisso
        )
        
        # Test get fixed costs
        success2, _ = self.run_test(
            "Costi - Get fixed costs",
            "GET",
            "costi/fissi",
            200
        )
        
        # Test variable costs
        today = datetime.now().strftime('%Y-%m-%d')
        costo_variabile = {
            "descrizione": "Materiali test",
            "importo": 150.50,
            "data": today
        }
        
        success3, var_data = self.run_test(
            "Costi - Add variable cost",
            "POST",
            "costi/variabili",
            200,
            costo_variabile
        )
        
        # Test get variable costs
        success4, _ = self.run_test(
            "Costi - Get variable costs",
            "GET",
            f"costi/variabili?data={today}",
            200
        )
        
        # Test delete if created successfully
        if success1 and fisso_data.get('costo_id'):
            self.run_test(
                "Costi - Delete fixed cost",
                "DELETE",
                f"costi/fissi/{fisso_data['costo_id']}",
                200
            )
            
        if success3 and var_data.get('costo_id'):
            self.run_test(
                "Costi - Delete variable cost", 
                "DELETE",
                f"costi/variabili/{var_data['costo_id']}",
                200
            )
        
        return success1 and success2 and success3 and success4

    def test_entrate_management(self):
        """Test income management"""
        print("\n📋 Testing Income Management...")
        
        today = datetime.now().strftime('%Y-%m-%d')
        entrata = {
            "descrizione": "Vendita test",
            "importo": 500.00,
            "data": today,
            "tipo": "registrata"
        }
        
        success1, entrata_data = self.run_test(
            "Entrate - Add income",
            "POST",
            "entrate",
            200,
            entrata
        )
        
        success2, _ = self.run_test(
            "Entrate - Get income",
            "GET",
            f"entrate?data={today}",
            200
        )
        
        # Test delete if created successfully
        if success1 and entrata_data.get('entrata_id'):
            self.run_test(
                "Entrate - Delete income",
                "DELETE",
                f"entrate/{entrata_data['entrata_id']}",
                200
            )
        
        return success1 and success2

    def test_materiali_management(self):
        """Test materials/inventory management"""
        print("\n📋 Testing Materials Management...")
        
        materiale = {
            "nome": "Cemento test",
            "quantita_disponibile": 100.0,
            "unita_misura": "kg",
            "consumo_medio_giornaliero": 5.0,
            "giorni_consegna": 7,
            "costo_unitario": 2.50
        }
        
        success1, mat_data = self.run_test(
            "Materiali - Add material",
            "POST",
            "materiali",
            200,
            materiale
        )
        
        success2, materials = self.run_test(
            "Materiali - Get materials with status",
            "GET",
            "materiali",
            200
        )
        
        # Check if status calculation works
        status_calculated = False
        if success2 and materials:
            for mat in materials:
                if 'stato' in mat:
                    status_calculated = True
                    print(f"✅ Material status calculated: {mat['nome']} - {mat['stato']}")
                    break
        
        # Test update material
        if success1 and mat_data.get('materiale_id'):
            update_data = {"quantita_disponibile": 80.0}
            success3, _ = self.run_test(
                "Materiali - Update material",
                "PATCH",
                f"materiali/{mat_data['materiale_id']}",
                200,
                update_data
            )
            
            # Test delete
            self.run_test(
                "Materiali - Delete material",
                "DELETE",
                f"materiali/{mat_data['materiale_id']}",
                200
            )
        else:
            success3 = False
        
        return success1 and success2 and success3 and status_calculated

    def test_dashboard(self):
        """Test dashboard data"""
        print("\n📋 Testing Dashboard...")
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        success, dashboard_data = self.run_test(
            "Dashboard - Get daily data",
            "GET",
            f"dashboard?data={today}",
            200
        )
        
        if success and dashboard_data:
            required_fields = ['utile', 'entrate', 'costi', 'stato']
            has_all_fields = all(field in dashboard_data for field in required_fields)
            
            if has_all_fields:
                print(f"✅ Dashboard data complete: Utile €{dashboard_data['utile']}, Stato: {dashboard_data['stato']}")
                return True
            else:
                print(f"❌ Dashboard missing fields: {dashboard_data}")
                return False
        
        return False

    def test_insights_ai(self):
        """Test AI insights generation"""
        print("\n📋 Testing AI Insights...")
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        # This might take time due to AI generation
        print("⏳ Generating AI insights (this may take 10-15 seconds)...")
        
        success, insights = self.run_test(
            "Insights - Generate AI insights",
            "GET",
            f"insights?data={today}",
            200
        )
        
        if success and insights:
            if len(insights) > 0:
                print(f"✅ AI insights generated: {len(insights)} insights")
                for insight in insights:
                    print(f"   - {insight['tipo']}: {insight['contenuto'][:100]}...")
                return True
            else:
                print("⚠️ No insights generated (expected for empty data)")
                return True
        
        return False

    def test_subscription(self):
        """Test subscription upgrade"""
        print("\n📋 Testing Subscription...")
        
        success, _ = self.run_test(
            "Subscription - Upgrade to PRO",
            "POST",
            "subscription/upgrade",
            200
        )
        
        return success

    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print("\n🧹 Cleaning up test data...")
        
        mongo_commands = f"""
use('test_database');
db.users.deleteMany({{user_id: '{self.user_id}'}});
db.user_sessions.deleteMany({{user_id: '{self.user_id}'}});
db.user_profiles.deleteMany({{user_id: '{self.user_id}'}});
db.costi_fissi.deleteMany({{user_id: '{self.user_id}'}});
db.costi_variabili.deleteMany({{user_id: '{self.user_id}'}});
db.entrate.deleteMany({{user_id: '{self.user_id}'}});
db.materiali.deleteMany({{user_id: '{self.user_id}'}});
db.insights_ai.deleteMany({{user_id: '{self.user_id}'}});
db.notifiche.deleteMany({{user_id: '{self.user_id}'}});
print('Test data cleaned up');
"""
        
        try:
            import subprocess
            result = subprocess.run(['mongosh', '--eval', mongo_commands], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print("✅ Test data cleaned up successfully")
            else:
                print(f"⚠️ Cleanup warning: {result.stderr}")
                
        except Exception as e:
            print(f"⚠️ Cleanup failed: {str(e)}")

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting BALANCE API Test Suite")
        print("=" * 50)
        
        # Setup
        if not self.setup_test_session():
            print("❌ Cannot proceed without test session")
            return False
        
        # Run tests
        auth_ok = self.test_auth_flow()
        if not auth_ok:
            print("❌ Authentication failed - stopping tests")
            self.cleanup_test_data()
            return False
        
        onboarding_ok = self.test_onboarding()
        costi_ok = self.test_costi_management()
        entrate_ok = self.test_entrate_management()
        materiali_ok = self.test_materiali_management()
        dashboard_ok = self.test_dashboard()
        insights_ok = self.test_insights_ai()
        subscription_ok = self.test_subscription()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Results
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS")
        print("=" * 50)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = BalanceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())