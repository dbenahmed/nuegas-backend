const express = require('express')

const router = express.Router()

router.route('/update').patch()
router.route('/remove').delete()
router.route('/').get()
router.route('/members/add').post()
router.route('/members/remove').delete()
router.route('/members').get()

module.exports = router