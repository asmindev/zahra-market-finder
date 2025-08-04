import os
import sys

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.market import Market


def seed_markets():
    """Seed the database with 20 sample markets"""

    markets_data = [
        {
            "name": "Pasar Beringharjo",
            "description": "Pasar tradisional terbesar di Yogyakarta yang menjual berbagai kebutuhan sehari-hari, batik, dan makanan tradisional.",
            "location": "Jl. Malioboro, Yogyakarta",
            "latitude": -7.7956,
            "longitude": 110.3695,
            "is_active": True,
        },
        {
            "name": "Pasar Tanah Abang",
            "description": "Pusat perdagangan tekstil terbesar di Asia Tenggara dengan ribuan toko yang menjual pakaian dan kain.",
            "location": "Jakarta Pusat, DKI Jakarta",
            "latitude": -6.1744,
            "longitude": 106.8294,
            "is_active": True,
        },
        {
            "name": "Pasar Klewer",
            "description": "Pasar batik terbesar di Solo yang menyediakan berbagai jenis batik tradisional dan modern.",
            "location": "Jl. Dr. Rajiman, Surakarta",
            "latitude": -7.5755,
            "longitude": 110.8243,
            "is_active": True,
        },
        {
            "name": "Pasar Sukawati",
            "description": "Pasar seni dan kerajinan tradisional Bali yang terkenal dengan ukiran kayu dan lukisan.",
            "location": "Sukawati, Gianyar, Bali",
            "latitude": -8.5569,
            "longitude": 115.2840,
            "is_active": True,
        },
        {
            "name": "Pasar Apung Lok Baintan",
            "description": "Pasar tradisional di atas air yang menjual sayuran, buah-buahan, dan makanan khas Kalimantan Selatan.",
            "location": "Lok Baintan, Banjar, Kalimantan Selatan",
            "latitude": -3.2840,
            "longitude": 114.8405,
            "is_active": True,
        },
        {
            "name": "Pasar 16 Ilir",
            "description": "Pasar tradisional di Palembang yang terkenal dengan pempek dan makanan khas Sumatra Selatan.",
            "location": "16 Ilir, Palembang, Sumatra Selatan",
            "latitude": -2.9761,
            "longitude": 104.7754,
            "is_active": True,
        },
        {
            "name": "Pasar Sentral Makassar",
            "description": "Pasar modern yang menggabungkan konsep tradisional dan modern dengan berbagai produk lokal Sulawesi.",
            "location": "Jl. Veteran Selatan, Makassar",
            "latitude": -5.1477,
            "longitude": 119.4327,
            "is_active": True,
        },
        {
            "name": "Pasar Bolu",
            "description": "Pasar tradisional di Banda Aceh yang menjual rempah-rempah, ikan segar, dan produk pertanian.",
            "location": "Banda Aceh, Aceh",
            "latitude": 5.5483,
            "longitude": 95.3238,
            "is_active": True,
        },
        {
            "name": "Pasar Raya Padang",
            "description": "Pasar induk Padang yang menyediakan bumbu masakan Padang dan produk pertanian Sumatra Barat.",
            "location": "Jl. Pasar Raya, Padang",
            "latitude": -0.9471,
            "longitude": 100.4172,
            "is_active": True,
        },
        {
            "name": "Pasar Minggu",
            "description": "Pasar tradisional besar di Jakarta Selatan yang menjual berbagai kebutuhan pokok dan makanan segar.",
            "location": "Jakarta Selatan, DKI Jakarta",
            "latitude": -6.2854,
            "longitude": 106.8415,
            "is_active": True,
        },
        {
            "name": "Pasar Simpang Limun",
            "description": "Pasar tradisional di Medan yang terkenal dengan durian, jeruk medan, dan produk pertanian Sumatra Utara.",
            "location": "Medan, Sumatra Utara",
            "latitude": 3.5952,
            "longitude": 98.6722,
            "is_active": True,
        },
        {
            "name": "Pasar Badung",
            "description": "Pasar tradisional terbesar di Denpasar dengan arsitektur khas Bali yang menjual berbagai kebutuhan sehari-hari.",
            "location": "Denpasar, Bali",
            "latitude": -8.6500,
            "longitude": 115.2167,
            "is_active": True,
        },
        {
            "name": "Pasar Flamboyan",
            "description": "Pasar modern di Pontianak yang menjual produk segar dan kebutuhan rumah tangga dengan fasilitas lengkap.",
            "location": "Pontianak, Kalimantan Barat",
            "latitude": -0.0263,
            "longitude": 109.3425,
            "is_active": True,
        },
        {
            "name": "Pasar Sentral Ambon",
            "description": "Pasar utama di Ambon yang menjual ikan segar, rempah-rempah Maluku, dan produk laut.",
            "location": "Ambon, Maluku",
            "latitude": -3.6954,
            "longitude": 128.1814,
            "is_active": True,
        },
        {
            "name": "Pasar Inpres Manokwari",
            "description": "Pasar tradisional di Papua Barat yang menjual hasil pertanian lokal, ikan, dan kerajinan tangan.",
            "location": "Manokwari, Papua Barat",
            "latitude": -0.8614,
            "longitude": 134.0640,
            "is_active": True,
        },
        {
            "name": "Pasar Cihapit",
            "description": "Pasar tradisional di Bandung yang terkenal dengan sayuran segar dari daerah pegunungan dan produk lokal.",
            "location": "Bandung, Jawa Barat",
            "latitude": -6.9034,
            "longitude": 107.6181,
            "is_active": True,
        },
        {
            "name": "Pasar Wage",
            "description": "Pasar tradisional di Purwokerto yang menjual berbagai kebutuhan sehari-hari dan makanan khas Banyumas.",
            "location": "Purwokerto, Jawa Tengah",
            "latitude": -7.4217,
            "longitude": 109.2340,
            "is_active": True,
        },
        {
            "name": "Pasar Lama Tangerang",
            "description": "Pasar bersejarah di Tangerang yang masih mempertahankan suasana tradisional dengan berbagai produk lokal.",
            "location": "Tangerang, Banten",
            "latitude": -6.1701,
            "longitude": 106.6420,
            "is_active": True,
        },
        {
            "name": "Pasar Panorama Lembang",
            "description": "Pasar wisata di Lembang yang menjual sayuran segar, buah-buahan, dan oleh-oleh khas Bandung.",
            "location": "Lembang, Bandung Barat",
            "latitude": -6.8109,
            "longitude": 107.6186,
            "is_active": True,
        },
        {
            "name": "Pasar Terapung Banjarmasin",
            "description": "Pasar apung tradisional di Banjarmasin yang beroperasi di atas sungai dengan perahu-perahu pedagang.",
            "location": "Banjarmasin, Kalimantan Selatan",
            "latitude": -3.3194,
            "longitude": 114.5906,
            "is_active": True,
        },
    ]

    print("🌱 Starting market seeding process...")

    # Check if markets already exist
    existing_markets = Market.query.count()
    if existing_markets > 0:
        print(f"⚠️  Database already contains {existing_markets} markets.")
        response = input("Do you want to clear existing data and reseed? (y/N): ")
        if response.lower() != "y":
            print("❌ Seeding cancelled.")
            return

        # Clear existing markets
        Market.query.delete()
        db.session.commit()
        print("🗑️  Existing markets cleared.")

    # Add new markets
    markets_added = 0
    for market_data in markets_data:
        try:
            market = Market(**market_data)
            db.session.add(market)
            markets_added += 1
            print(f"➕ Added: {market_data['name']}")
        except Exception as e:
            print(f"❌ Error adding {market_data['name']}: {str(e)}")
            continue

    try:
        db.session.commit()
        print(f"✅ Successfully seeded {markets_added} markets to the database!")

        # Display summary
        total_markets = Market.query.count()
        active_markets = Market.query.filter_by(is_active=True).count()
        print(f"📊 Summary:")
        print(f"   Total markets in database: {total_markets}")
        print(f"   Active markets: {active_markets}")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error committing to database: {str(e)}")


def main():
    """Main function to run the seeder"""
    print("🏪 Market Finder - Database Seeder")
    print("=" * 40)

    # Create Flask app context
    app = create_app()

    with app.app_context():
        try:
            # Ensure database tables exist
            db.create_all()

            # Run the seeder
            seed_markets()

        except Exception as e:
            print(f"❌ Fatal error: {str(e)}")
            print("💡 Make sure your database is running and properly configured.")


if __name__ == "__main__":
    main()
