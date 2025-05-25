import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to PostgreSQL server
conn = psycopg2.connect(
    dbname='postgres',
    user='postgres',
    password='$Qlbench3r20',
    host='localhost',
    port='5432'
)

conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cursor = conn.cursor()

# Check if database exists
cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'frisdb'")
exists = cursor.fetchone()

if not exists:
    print("Creating database 'frisdb'...")
    cursor.execute('CREATE DATABASE frisdb')
    print("Database 'frisdb' created successfully!")
else:
    print("Database 'frisdb' already exists.")

cursor.close()
conn.close()

print("Database setup completed.")
