const { body } = require('express-validator');

// Function to generate userId validator
function getUserIdValidator(isOptional = false) {
    const validatorChain = body('userId')
        .trim()
        .isString().withMessage('User ID creating the task must be a string')
        .escape();

    if (!isOptional) {
        validatorChain.notEmpty().withMessage('User ID creating the task is required');
    } else {
        validatorChain.optional();
    }

    return validatorChain;
}

// Function to generate name validator
function getNameValidator(isOptional = false) {
    const validatorChain = body('name')
        .trim()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 16 }).withMessage('Name must be between 1 and 16 characters')
        .matches(/^[a-z0-9 ]+$/i).withMessage('Name can only contain alphanumeric characters and spaces')
        .escape();

    if (!isOptional) {
        validatorChain.notEmpty().withMessage('Name is required');
    } else {
        validatorChain.optional();
    }

    return validatorChain;
}

// Function to generate dueDate validator
function getDueDateValidator(isOptional = false) {
    const validatorChain = body('dueDate')
        .isISO8601().withMessage('DueDate should be of type date ISO8601')
        .toDate();

    if (!isOptional) {
        validatorChain.notEmpty().withMessage('DueDate is required');
    } else {
        validatorChain.optional({ values: 'null' });
    }

    return validatorChain;
}

// Function to generate deadlineDate validator
function getDeadlineDateValidator(isOptional = false) {
    const validatorChain = body('deadlineDate')
        .isISO8601().withMessage('Deadline Date should be of type date ISO8601')
        .toDate();

    if (!isOptional) {
        validatorChain.notEmpty().withMessage('Deadline Date is required');
    } else {
        validatorChain.optional({ values: 'null' });
    }

    return validatorChain;
}

// Function to generate priority validator
function getPriorityValidator(isOptional = false) {
    const validatorChain = body('priority')
        .trim()
        .isString().withMessage('Priority must be a string')
        .isIn(['low', 'medium', 'high', 'urgent', 'no-priority']).withMessage('Priority must be one of: low, medium, high, urgent, no-priority');

    if (!isOptional) {
        validatorChain.notEmpty().withMessage('Priority is required');
    } else {
        validatorChain.optional();
    }

    return validatorChain;
}

// Function to generate status validator
function getStatusValidator(isOptional = false) {
    const validatorChain = body('status')
        .trim()
        .isString().withMessage('Status must be a string')
        .isIn(['todo', 'done', 'doing', 'cancelled', 'backlog', 'in-review']).withMessage('Status must be one of: todo, done, doing, cancelled, backlog, in-review');

    if (!isOptional) {
        validatorChain.notEmpty().withMessage('Status is required');
    } else {
        validatorChain.optional();
    }

    return validatorChain;
}

// Function to generate parentProject validator
function getParentProjectValidator(isOptional = false) {
    const validatorChain = body('parentProject')
        .trim();

    if (!isOptional) {
        validatorChain.notEmpty().withMessage('Parent Project is required');
    } else {
        validatorChain.optional({ values: 'null' });
    }

    return validatorChain;
}

// Function to generate assignees validator
function getAssigneesValidator(isOptional = false) {
    const validatorChain = body('assignees')
        .isArray().withMessage('Assignees must be an array');

    if (!isOptional) {
        validatorChain.notEmpty().withMessage('Assignees are required');
    } else {
        validatorChain.optional();
    }

    return validatorChain;
}

module.exports = {
    getUserIdValidator,
    getNameValidator,
    getDueDateValidator,
    getDeadlineDateValidator,
    getPriorityValidator,
    getStatusValidator,
    getParentProjectValidator,
    getAssigneesValidator,
};