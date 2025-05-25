import psycopg2

# Connect to the frisdb database
conn = psycopg2.connect(
    dbname='frisdb',
    user='postgres',
    password='$Qlbench3r20',
    host='localhost',
    port='5432'
)

cursor = conn.cursor()

# Get list of all tables in the database
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
""")

tables = cursor.fetchall()

print("Tables created in the database:")
for table in tables:
    print(f"- {table[0]}")

# For each table, get column information
print("\nTable details:")
for table in tables:
    cursor.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '{table[0]}'
        ORDER BY ordinal_position;
    """)
    
    columns = cursor.fetchall()
    
    print(f"\n{table[0]} table:")
    for column in columns:
        print(f"  - {column[0]} ({column[1]})")

cursor.close()
conn.close()
