exports.home = (req, res) => {
  res.status(200).json({
    success: true,
    gretting: "Hello Bitch!!!",
  });
};
