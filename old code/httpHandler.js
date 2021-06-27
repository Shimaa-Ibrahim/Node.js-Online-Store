exports.httpHandler = (req, res) => {
  const url = req.url;

  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>First Assignment - Home</title></head>");
    res.write("<body>");
    res.write("<h1>Hello</h1>");
    res.write(
      "<form  action='/create-user' method='POST'><input type='text' placehplder='User Name' name='username'><button type='submit'>submit</button></form>"
    );
    res.write("</body>");
    res.write("<html>");
    return res.end();
  }

  if (url === "/users") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>First Assignment - Users</title></head>");
    res.write("<body> <ul><li>User 1</li><li>User 2</li></ul> </body>");
    res.write("</html>");
    return res.end();
  }

  if (url === "/create-user" && req.method === "POST") {
    const body = [];
    req.on("data", chunk => {
      body.push(chunk);
      // console.log(chunk)
    });
    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log(
        "key:",
        parsedBody.split("=")[0],
        " - value:",
        parsedBody.split("=")[1]
      );
    });
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }
};
