import sqlite3

def check():
    conn = sqlite3.connect('server/test.db')
    cursor = conn.cursor()
    
    # Check columns of table 'usuario'
    cursor.execute("PRAGMA table_info(usuario);")
    print('Columns of usuario:', cursor.fetchall())
    
    # Query all records in 'usuario'
    cursor.execute("SELECT * FROM usuario;")
    users = cursor.fetchall()
    print('\nUsers:', users)
    
    # Check columns of table 'empresa'
    cursor.execute("PRAGMA table_info(empresa);")
    print('\nColumns of empresa:', cursor.fetchall())

check()
