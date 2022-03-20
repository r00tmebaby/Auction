import asyncio
import json
import random
import time
import unittest
from datetime import datetime
import pytest
import pymongo
import requests
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from tabulate import tabulate
from pydantic import BaseModel
from colorama import Fore

_HOST = "127.0.0.1"
_PORT = 8080
_URL = f"http://{_HOST}:{_PORT}/api/"


class User(BaseModel):
    name: str = "test"
    surname: str = "test1"
    email: str = "test2"
    password: str = "test3"


# Creating user Olga
olga = User(
    name="Olga",
    surname="Kurylenko",
    email="olga@gov.uk",
    password="olga123"
)

# Creating user Nick
nick = User(
    name="Nick",
    surname="Jackson",
    email="nick@gov.uk",
    password="nick123"
)

# Creating user Mary
mary = User(
    name="Mary",
    surname="Elizabeth",
    email="mary@gov.uk",
    password="mary123"
)


# Extends user class so that we assign the login token prior to use the object for further tests
class Auth(User):
    user: User
    token: str


# List of the authenticated users
auth_users: list[Auth] = []

# For easier registration we do iterations
new_users: list[User] = [olga, nick, mary]

# Creating default object instances
user = User()
check = unittest.TestCase()

try:
    # Get database cursor
    mongo = pymongo \
        .MongoClient("mongodb+srv://r00tme:zdr123@cluster0.vnsob.mongodb.net/AuctionApp?retryWrites=true&w=majority") \
        .get_database("AuctionApp")
except ConnectionError:
    raise ConnectionError("Cannot connect to the database")

# We make sure that the database is empty before we start
DB_ITEMS: mongo = mongo['items']
DB_USERS: mongo = mongo['users']
DB_AUCTIONS: mongo = mongo['auctions']
# We make sure that the database is empty before we start
DB_ITEMS.delete_many({})
DB_USERS.delete_many({})
DB_AUCTIONS.delete_many({})


def get_all_user_items(user_name: str) -> list:
    request = get_data("auction/all", user_name)
    return [i for i in request.json()['data'] if i['seller_name'] == user_name]


def post_data(endpoint: str, item: dict, user_name: str):
    """
        Iterates over the logged users, find their tokens and create a request to post an object
        We do not specify the item data (could be different type of object added later)
        here which could give us a scalability so any object can be processed.
        That is why auction/add endpoint is not hardcoded and must be passed as an argument
    """
    return requests.post(
        _URL + endpoint,
        json=jsonable_encoder(item),
        headers=
        {
            "auth-token": f"{[i.token for i in auth_users if i.user.name == user_name][0]}",
            "accept": "application/json"
        }
    )


def get_item_by_id_db(item_id: ObjectId) -> dict:
    return DB_AUCTIONS.find_one({"_id": ObjectId(item_id)})


def get_user_by_id(user_id: ObjectId) -> dict:
    return DB_USERS.find_one({"_id": ObjectId(user_id)})


def get_max_bid(item_id: ObjectId) -> int:
    bids = [i['bid'] for i in get_item_by_id_db(item_id)['bids']]
    return max(bids) if len(bids) > 0 else 0


def get_data(endpoint: str, user_name: str):
    return requests.get(
        _URL + endpoint,
        headers=
        {
            "auth-token": f"{[i.token for i in auth_users if i.user.name == user_name][0]}",
            "accept": "application/json"
        }
    )


def test_server_is_running() -> pytest:
    check.assertEqual(200, requests.get(_URL).status_code)


def test_user_incorrect_register() -> pytest:
    """Send incorrect email field, expects status code 400"""

    endpoint = "auth/register"
    r = requests.post(_URL + endpoint, json=jsonable_encoder(user))
    check.assertEqual(400, r.status_code)


def test_user_register(
        new_user: User = User(
            name="Zdravko",
            surname="Georgiev",
            email="r00tme@abv.bg",
            password="zdravko123"
        )
) -> pytest:
    """ Send correct email field, expects status code 200 or user is already registered"""

    endpoint = "auth/register"

    r = requests.post(_URL + endpoint, json=jsonable_encoder(new_user))
    check.assertTrue("User already exists" in r.text or r.status_code == 200)


def test_user_fake_login() -> pytest:
    endpoint = "auth/login"
    r = requests.post(_URL + endpoint, json=jsonable_encoder(user))
    check.assertEqual(400, r.status_code)  # Send fake user, should return 400


def test_user_login(login=None) -> str:
    """ Trying to log in with the already registered user and fetch the authentication token """
    if login is None:
        login = {
            "email": "r00tme@abv.bg",
            "password": "zdravko123"
        }
    endpoint = "auth/login"
    r = requests.post(_URL + endpoint, json=login)
    check.assertEqual(200, r.status_code)  # Check the endpoint by sending login data
    token = json.loads(r.text)['auth-token']
    check.assertIsNotNone(token)  # Check if the response contains auth-token
    check.assertEqual(149, len(token))  # Check if the token is with length of 149 - *presumably valid
    return token


def test_user_details() -> pytest:
    """ Test whether the user details endpoint returns success message as expected with the auth-token provided """
    endpoint = "user/details"
    r1 = requests.get(_URL + endpoint, headers={
        "auth-token": test_user_login(),
        "accept": "application/json"
    })
    check.assertTrue(r1.json()['message'] == "Success")


def test_user_history() -> pytest:
    endpoint = "user/history/"
    types = ['test', 'won', 'lost', 'sold']

    for each_type in types:
        r = requests.get(_URL + endpoint + each_type, each_type, headers={
            "auth-token": test_user_login(),
            "accept": "application/json"
        })
        check.assertEqual(r.json()['message'], "Success")


"""
    Since we have checked all pre-testing endpoints. Now we can proceed with the auction interaction
        TC 1. Olga, Nick and Mary register in the application and are ready to access the API.
        TC 2. Olga, Nick and Mary will use the oAuth v2 authorisation service to get their tokens.
        TC 3. Olga makes a call to the API (any endpoint) without using a token. This call
        should be unsuccessful as the user is unauthorised.
        TC 4. Olga adds an item for auction with an expiration time using her token.
        TC 5. Nick adds an item for auction with an expiration time using his token.
        TC 6. Mary adds an item for auction with an expiration time using her token.
        TC 7. Nick and Olga browse all the available items, there should be three items
        available.
        TC 8. Nick and Olga get the details of Mary’s item.
        TC 9. Mary bids for her item. This call should be unsuccessful, an owner cannot
        bid for their own items.
        TC 10. Nick and Olga bid for Mary’s item in a round-robin fashion (one after the
        other).
        TC 11. Nick or Olga wins the item after the end of the auction.
        TC 12. Olga browses all the items sold, lost and won.
        TC 13. Mary queries for a list of bids as historical records of bidding actions of her
        sold item, won items and lost items.
"""


def test_TC_1():
    """ TC 1. Olga, Nick and Mary register in the application and are ready to access the API. """
    for each_user in new_users:
        test_user_register(each_user)  # check the endpoint response if user is registered

    # Check if we really have 4 users added in the database (Zdravko,Mary, Nick, Olga)
    if DB_USERS.count_documents({}) == 4:
        check.assertTrue(True)


def test_TC_2():
    """
        We test and login each one of the registered users and if tests are successful to fetch their auth-token
        TC 2. Olga, Nick and Mary will use the oAuth v2 authorisation service to get their tokens.
    """

    for each_user in new_users:
        auth_users.append(
            Auth(
                user=each_user,
                token=test_user_login(  # will test each user login by calling the test_user_login function
                    {
                        "email": each_user.email,
                        "password": each_user.password,
                    }
                )
            )
        )


def test_confirm_authenticated_users():
    """ Make sure that we have 3 authenticated users """
    check.assertEqual(3, len(auth_users))


def test_TC_3():
    """ Trying to access an auction API without providing auth-token """

    check.assertEqual(401, requests.get(_URL + "auction/1").status_code)  # Not authenticated


def test_TC_4_5_6():
    """
        Olga, Nick and Mary are adding individual items for auction using their auth tokens
        TC 4. Olga adds an item for auction with an expiration time using her token.
        TC 5. Nick adds an item for auction with an expiration time using his token.
        TC 6. Mary adds an item for auction with an expiration time using her token.
    """

    endpoint = "auction/add"
    # Not logged users can't post an item
    check.assertFalse(requests.post(_URL + endpoint).status_code == 200)

    new_item = """{
        "starting_price": '%d',
        "exp_time": '%d',
        "exp_type": "seconds",
        "item": {
            "title": "%s new item for sale",
            "condition": "%s",
            "description": "%s has a new item which is great"
        }
    }"""

    for i, each_user in enumerate(new_users):
        unique_item = eval(new_item % (
            random.randint(0, 10),
            30,  # let's say that the item will expire between 10 seconds. Quick testing
            each_user.name,
            random.choice(['New', "Used"]),
            "%s %s" % (each_user.name, each_user.surname)
        ))
        # The item was added successfully, based on the endpoint response
        check.assertEqual(
            post_data(endpoint, unique_item, each_user.name).json()['message'],
            "The new Item has been added to the auction"
        )

        # Make sure that we have n items added successfully in the database
        check.assertEqual(i + 1, DB_AUCTIONS.count_documents({}))

        # Try to add the same item, should not be possible
        check.assertEqual(
            post_data(endpoint, unique_item, each_user.name).json()['message'], "This item is added already"
        )


def test_TC_7_8():
    """
        TC 7. Nick and Olga browse all the available items, there should be three items available.
        TC 8. Nick and Olga get the details of Mary’s item.
    """
    endpoint = "auction/all"
    users = [nick, olga]

    for each_user in users:
        request = get_data(endpoint, each_user.name)

        # Nick and Olga are not logged but trying to fetch results
        check.assertEqual(401, requests.get(_URL + "auction/1").status_code)  # Not Authenticated

        # Nick and Olga should be able to access the endpoint with providing the auth-token
        check.assertEqual(200, request.status_code)  # Authenticated

        # Nick and Olga should see only 3 items in total
        check.assertEqual(3, len(request.json()))

        # Nick and Olga get the details of Mary’s item. Must be only one item.
        check.assertEqual(1, len(get_all_user_items(each_user.name)))


def test_TC_9_10():
    """
        TC 9. Mary bids for her item. This call should be unsuccessful, an owner cannot bid for their own items.
        TC 10. Nick and Olga bid for Mary’s item in a round-robin fashion (one after the other).
    """
    endpoint = "auction/bid"
    mary_item = get_all_user_items("Mary")[0]  # we take the first item for the test, since we added only one

    item_id = mary_item['_id']
    seller = mary_item['seller_name']
    zillions = 0x9DD4237B636E67B207B1

    # Testing boundary conditions before processing a valid data
    test_bound_con = [

        # Bidder      Item      Bid                API message                                         API status code
        # -------------------------------------------------------------------------------------------------------------
        [seller, item_id, 60, "You can not bid for your own item", 400],
        ["Olga", item_id, zillions, "\"bid\" must be a safe number", 400],
        ["Nick", item_id, None, "\"bid\" is required", 400],
        ["Nick", None, 2, "\"item_id\" is required", 400],
        ["Nick", None, None, "\"item_id\" is required", 400],
        ["Olga", "", None, "\"item_id\" is not allowed to be empty", 400],
        ["Nick", "sdfs", None, "\"item_id\" length must be at least 24 characters long", 400],
        ["Olga", "s" * 24, 22, "This auction does not exist", 400],
        ["Olga", item_id, -5667, "\"bid\" must be larger than or equal to 1", 400],
        ["Nick", item_id, 24.53, "\"bid\" must be an integer", 400],
        ["Nick", item_id, "", "\"bid\" must be a number", 400],
        ["Nick", 22, 12, "\"item_id\" must be a string", 400],
    ]
    for each_bid_test in test_bound_con:
        if each_bid_test[1] is None:
            bid_json = {"bid": each_bid_test[2]}
        elif each_bid_test[2] is None:
            bid_json = {"item_id": each_bid_test[1]}
        elif each_bid_test[2] is None and each_bid_test[2] is None:
            bid_json = {}
        else:
            bid_json = {"item_id": each_bid_test[1], "bid": each_bid_test[2]}
        check.assertEqual(post_data(endpoint, bid_json, each_bid_test[0]).json()['message'], each_bid_test[3])

    # Confirm that not a single bid has been placed in the database from the above tests
    # We can not trust the endpoint in 100%, it may still add the data regardless status code and message
    check.assertEqual(0, len(get_item_by_id_db(mary_item['_id'])['bids']))

    # Finally, the most interesting part here, we do some bidding's
    start_time = int(time.time())
    end_time = start_time + 35  # add some seconds, so we can bid until auction expires
    bidders = [nick, olga]

    increase, start_bid, stop_bid = 0, 1, 5000

    output = [
        ['Time', 'Bidder', "Bid", "Max-Bid", "Seller", "API message"]
    ]

    while int(time.time()) < end_time:
        """
            We do not really care who is going to bid first, when and how much. 
            It can be a random choice as in real the life.
            Although, we are interested in the sequence of unpredictable events and how the API will respond to them. 
            Pushing it to boundary conditions prior to find issues and flaws.
        """

        # Select Nick or Olga
        get_bidder = bidders[random.randint(0, 1)]

        # will increase the start for each iteration
        cur_start = start_bid + increase

        # will increase the end for each iteration
        cur_stop = stop_bid + increase + 2

        for bid in range(cur_start, cur_stop, random.randint(cur_start, cur_stop)):
            # Let's create some bids
            bid_object = {
                "item_id": mary_item['_id'],
                "bid": bid
            }

            r = post_data(endpoint, bid_object, get_bidder.name)

            # We need some rest time between the requests so that responses do not overlap
            # This pause time very much depends on the internet connection.
            # Some tests may fail if the reposes do not arrive quick enough
            time.sleep(0.5)  # Make a coffee while bidding :-)

            message_type = Fore.RED + "%s" + Fore.RESET

            # Let's see what is happening here...
            if int(get_item_by_id_db(mary_item['_id'])['exp_date']) <= int(time.time()):
                # Check whether bid has been placed regardless that auction has expired
                check.assertNotEqual(get_max_bid(mary_item['_id']), bid)

            else:
                if get_max_bid(mary_item['_id']) > bid or bid < get_item_by_id_db(mary_item['_id'])['starting_price']:
                    # If there is an attempt for underbid or starting price is lower should get an error message
                    check.assertTrue(
                        "Sorry, the seller has a starting price of" in r.json()['message']
                        or
                        "You can not underbid the current highest bid" in r.json()['message']
                    )
                    # Make sure that regardless the message the bid has not been added in the DB
                    check.assertNotEqual(get_max_bid(mary_item['_id']), bid)
                else:
                    message_type = Fore.GREEN + "%s" + Fore.RESET

                    # Confirm by comparing with the max bid in the DB if that is true.
                    # The max bid should be the current.
                    check.assertAlmostEqual(get_max_bid(mary_item['_id']), bid)

            output.append(
                [
                    str(datetime.today()).split(".")[0],
                    get_bidder.name,
                    bid,
                    get_max_bid(mary_item['_id']) if get_max_bid(mary_item['_id']) > 0 else mary_item['starting_price'],
                    mary_item['seller_name'],
                    message_type % r.json()['message']
                ]
            )
        increase += 1

    print("\n" + tabulate(output, showindex=True, headers='firstrow', tablefmt="psql", stralign="right"))


def test_TC_11_12_13():
    """ TC 11. Nick or Olga wins the item after the end of the auction.
        TC 12. Olga browses all the items sold, lost and won.
        TC 13. Mary queries for a list of bids as historical records of bidding actions of her
        sold item, won items and lost items.
    """
    # we take the first item for the test, since we added only one
    mary_item = get_all_user_items("Mary")[0]['bids'][-1]

    # let's check who actually won the item from the Database not API (last element is the winner)
    actual_winner_bid = mary_item['bid']
    actual_winner_info = get_user_by_id(mary_item['user'])

    def count_data(endpoint: str, user_name: str = "Mary") -> int:
        return len(get_data(endpoint, user_name).json()['data'])

    # All logged users should see same list of auctions
    for each_user in new_users:
        # Should have three expired items in total
        check.assertEqual(3, count_data(endpoint="auction/expired", user_name=each_user.name))

        # Should have three items in total
        check.assertEqual(3, count_data(endpoint="auction/all", user_name=each_user.name))

        # Should have zero not-expired items in total
        check.assertEqual(0, count_data(endpoint="auction/noexpired", user_name=each_user.name))

    # -------------------   Mary Requests   -----------------------------------

    # Should have zero won items. Mary is a seller she did not bid any item
    check.assertEqual(0, count_data(endpoint="user/history/won"))

    # Should have zero lost items. Mary is a seller she did not bid any item
    check.assertEqual(0, count_data(endpoint="user/history/lost"))

    # Should have 1 sold item
    check.assertEqual(1, count_data(endpoint="user/history/sold"))

    # Let's compare the actual winning bid with the API response bid
    api_winner_bid = get_data("user/history/sold", "Mary").json()['data'][0]['bids'][-1]['bid']
    check.assertEqual(actual_winner_bid, api_winner_bid)

    # -------------------   Olga and Nick Requests   -----------------------------------
    # Check the winner from the DB if match the API response
    if actual_winner_info['name'] == "Olga":
        check.assertEqual(1, count_data(endpoint="user/history/won", user_name="Olga"))
    elif actual_winner_info['name'] == "Nick":
        check.assertEqual(1, count_data(endpoint="user/history/won", user_name="Nick"))
    else:
        check.assertEqual(0, count_data(endpoint="user/history/won", user_name="Nick"))
        check.assertEqual(0, count_data(endpoint="user/history/won", user_name="Olga"))


async def run():
    pytest.main(
        [
            "testing.py",
            "-s",
            "-W",
            "ignore:Module already imported:pytest.PytestWarning"
        ]
    )


if __name__ == '__main__':
    asyncio.run(run())
