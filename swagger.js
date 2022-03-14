const swagger_options = {
    definition: {
      openapi: "3.0.1",
      info: {
        title: "Cloud Computing Concepts - Auction 🚀",
        version: "0.0.1",
        description: `<h2>🔒 Authentication</h2>
        <p>All users:</p>
        <ul>
        <li><strong>Login</strong> - login using a valid email and password</li>
        <li><strong>Logout</strong> - to logout from the system</li>
        <li><strong>Register</strong> - to register to the system</li>
        </ul>
        <h2>🏠 Auction</h2>
        <p>Only registered users:</p>
        <ul>
        <li><strong>Active auctions</strong> - You can see all active auctions in the system </li>
        <li><strong>Expired auctions</strong> - You can see all expired auctions in the system</li>
        <li><strong>Post item</strong> - You can post your item for sell with deserable starting price and expiration time </li>
        <li><strong>Bids</strong> - You can bid for other people items</li>
        </li>
        </ul>
        <h2>🙋 User Panel</h2>
        <p>Only registered users:</p>
        <ul>
        <li><strong>Won Items</strong> - You can see all items that you have won </li>
        <li><strong>Sold Items</strong> - You can see all items that you have sold</li>
        <li><strong>Lost Items</strong> - You can see all items that you have placed a bid but did not win</li>
        <li><strong>Change Details</strong> <em>*- You can change your details <span class='text-danger'>(NOT IMPLEMENTED YET)<span></em></li>
        </ul></div>
        `,
        contact: {
          name: "Zdravko Georgiev",
          url: "https://github.com/r00tmebaby",
          email: "zgeorg01@gmail.com"
        },
        license: {
          name: "Apache 2.0",
          url: "https://www.apache.org/licenses/LICENSE-2.0.html"
        },
      },
      
      explorer:true,
      persistAuthorization:true,
      servers: [
        {
          url: "http://127.0.0.1:" +process.env.SERVER_PORT,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: 'auth-token',
          },
        },
      },
      security: [
        {
          ApiKeyAuth: [],
        },
      ],
    },
    apis: ["./routes/*.js"],
  }

module.exports.swagger_options = swagger_options