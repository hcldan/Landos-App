from bottle import route, get, post, request, run, abort, static_file, error, response, debug, parse_auth
import sqlite3
import json
import uuid
import datetime
import mail

########## Item CRUD Methods ##########

@route('/item', method='POST')
def create_item():
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    if request.headers.get("Authorization"):
        (user, run_id) = parse_auth(request.headers["Authorization"])
    else:
        abort(401, "Unauthorized")

    print str(user) + str(run_id)
    data = request.body.readline()
    print data
    if not data:
        abort(400, 'No Data Recieved')
    item = json.loads(data)
    if not item.has_key("name"):
        abort(400, 'No name specified')
    if not item.has_key("size"):
        abort(400, 'No size specified')
    if not item.has_key("price"):
        abort(400, 'No price specified')
    if not item.has_key("quantity"):
        abort(400, 'No quantity specified')
    if not item.has_key("size"):
        abort(400, 'No size specified')
    
    id = uuid.uuid4().hex
    name = item["name"]
    size = item["size"]
    price = item["price"]
    quantity = item["quantity"]
    comments = item["comments"]

    c.execute("INSERT into items values (?,?,?,?,?,?,?,?)",
      [id, user, run_id, name, size, price, quantity, comments])

    conn.commit()

    response.status = 201
    return json.dumps({"id" : id})

@route('/item/:id', method='GET')
def get_item(id):
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    if request.headers.get("Authorization"):
        (user, run_id) = parse_auth(request.headers["Authorization"])
    else:
        abort(401, "Unauthorized")

    c.execute("SELECT name, size, price, quantity, comments from items where id=?", (id,))
    result = c.fetchone()

    if not result:
        abort(404, "Could not find item")
    
    item = {}

    item["id"] = id
    item["name"] = result[0]
    item["size"] = result[1]
    item["price"] = result[2]
    item["quantity"] = result[3]
    item["comments"] = result[4]

    return json.dumps(item)
    
@route('/item/:id', method='PUT')
def update_item(id):
    abort(501, 'Not implemented')

@route('/item/:id', method='DELETE')
def delete_item(id):
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    #if request.headers.get("Authorization"):
    #    (user, run_id) = parse_auth(request.headers["Authorization"])
    #else:
    #    abort(401, "Unauthorized")

    c = conn.cursor()
    c.execute("DELETE from items where id=?", (id,))
    conn.commit()

########## Collection methods ##########

@route('/items2', method='GET')
def get_items_for_user():
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    if request.headers.get("Authorization"):
        (user, run_id) = parse_auth(request.headers["Authorization"])
    else:
        abort(401, "Unauthorized")

    print str(user) + str(run_id)    
    c.execute("SELECT id, name, size, price, quantity, comments from items where user=? and run_id=?", (user, run_id))
    results = c.fetchall()

    if not results:
        return json.dumps([])
    
    items = []

    for result in results:
        item = {}
        item["id"] = result[0]
        item["name"] = result[1]
        item["size"] = result[2]
        item["price"] = result[3]
        item["quantity"] = result[4]
        item["comments"] = result[5]
        items.append(item)

    return json.dumps(items)

@route('/items', method='GET')
def get_items():
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    c.execute('SELECT id,name,description,category from item')
    items = c.fetchall()
    
    items_l = []

    for item in items:
        items_d = {}
        items_d["id"] = item[0]
        items_d["name"] = item[1]
        items_d["description"] = item[2]
        items_d["category"] = item[3]
        items_l.append(items_d)

    return json.dumps(items_l)

@route('/orders/all', method='GET')
def get_all_orders():
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    if request.headers.get("Authorization"):
        (user, run_id) = parse_auth(request.headers["Authorization"])
    else:
        abort(401, "Unauthorized")

    orders = []

    c.execute("SELECT email from users")
    users = c.fetchall()

    if not users:
        return json.dumps([])

    for user in users:
        c.execute("SELECT id, name, size, price, quantity, comments from items where user=? and run_id=? order by name", (user[0],run_id))
        results = c.fetchall()
    
        if not results:
            continue

        order = {}
        items = []
        total = 0
        
        for result in results:
            item = {}
            item["id"] = result[0]
            item["name"] = result[1]
            item["size"] = result[2]
            item["price"] = float(result[3]) * float(result[4])
            item["quantity"] = float(result[4])
            item["comments"] = result[5]
            items.append(item)
            total += item["price"]

            order["items"] = items
            order["run_id"] = run_id
            order["total"] = total
            order["user"] = user
    
        orders.append(order)

    return json.dumps(orders)

@route('/orders', method='GET')
def get_orders():
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    if request.headers.get("Authorization"):
        (user, run_id) = parse_auth(request.headers["Authorization"])
    else:
        abort(401, "Unauthorized")
        
    print str(user) + str(run_id)
    c.execute("SELECT distinct run_id FROM items where user=?", (user,))
    run_ids = c.fetchall()

    if not run_ids:
        return json.dumps([])

    orders = []
    
    for run_id in run_ids:
        print str(run_id[0])
        c.execute("SELECT id, name, size, price, quantity, comments from items where user=? and run_id=? order by name", (user,run_id[0]))
        results = c.fetchall()

        if not results:
            print "no results"
            continue

        order = {}
        items = []
        total = 0
        
        for result in results:
            item = {}
            item["id"] = result[0]
            item["name"] = result[1]
            item["size"] = result[2]
            item["price"] = float(result[3]) * float(result[4])
            item["quantity"] = float(result[4])
            item["comments"] = result[5]
            items.append(item)
            total += item["price"]

        order["items"] = items
        order["run_id"] = run_id[0]
        order["total"] = total
        order["user"] = user

        orders.append(order)

    return json.dumps(orders)

########## Run Management Methods ##########

@route('/run/create', method='POST')
def create_run():
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    data = request.body.readline()
    if not data:
        abort(400, 'No Data Recieved')
    order = json.loads(data)
    if not order.has_key('user'):
        abort(400, 'No user specified')

    c.execute("SELECT * from runs where date(date) like date('now')")
    run = c.fetchone()

    if run:
        abort(200, "A run already exists")
        
    run_id = uuid.uuid4().hex
    user_id = order["user"]
    date_placed = datetime.datetime.now()

    c.execute("INSERT into runs values (?, ?, ?)", (run_id, user_id, date_placed))

    conn.commit()

    mail.send_run_email(run_id, c)

    response.status = 201
    return json.dumps({"run_id" : run_id})

@route('/run/current', method='GET')
def get_current_run():
    conn = sqlite3.connect('data_new.sqlite', timeout=10)
    c = conn.cursor()
    c.execute("SELECT run_id from runs where date(date) like date('now')")
    run = c.fetchone()

    if run is None:
        run_id = ""
    else:
        run_id = run[0]
    
    return json.dumps({"run_id" : run_id})

########## Payment Methods ##########

@route('/order/pay', method='POST')
def pay_order():
    data = request.body.readline()
    if not data:
        abort(400, 'No Data Recieved')
    order = json.loads(data)
    if not order.has_key('user'):
        abort(400, 'No user specified')
    if not order.has_key('run_id'):
        abort(400, 'No run_id specified')

    order_id = order["order_id"]
        
    c.execute("UPDATE payment set status=?", ("Payment Received", order_id))

    conn.commit()

    return json.dumps({"status" : "Payment Received"})

########## Error methods ##########

@error(400)
def error400(error):
    return json.dumps({"error" : "Bad request", "status_code" : 400})

@error(401)
def error400(error):
    return json.dumps({"error" : "Unauthorized", "status_code" : 401})

@error(501)
def error501(error):
    return json.dumps({"error" : "Not implemented", "status_code" : 501})

@error(404)
def error404(error):
    return json.dumps({"error" : "No item found", "status_code" : 404})

@route('/sizes/:id', method='GET')
def get_sizes(id):
    sizes = ["Mini", "Small", "Large"]

    return json.dumps(sizes)

########## User Methods ##########

@route('/user', method='POST')
def make_user():
    data = request.body.readline()
    if not data:
        abort(400, 'No Data Recieved')
    user = json.loads(data)
    
    if not user.has_key('name'):
        abort(400, 'No name specified')

    try:
        id = uuid.uuid4().hex
        name = user['name']
        created = datetime.datetime.now()

        c.execute('INSERT into user values(?, ?, ?)', (id, name, created))

        conn.commit()
        
    except Exception as e:
        abort(400, str(e))

########## Static file methods ##########

@route('/<filename:path>')
def send_static(filename):
    return static_file(filename, root='/var/www/Landos-App/client')

#debug(True)

#run(host='0.0.0.0', port=8080, server='paste')
