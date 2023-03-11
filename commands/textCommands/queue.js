function printQueue(message, queueInfos) {
    if (queueInfos.length === 0) {
        message.channel.send("la queue est vide :)")
    } else {
        message.channel.send(queueInfos.toString());
    }
}

module.exports = {
    printQueue
}

/*
* @TODO :
*   queue clear
*   queue remove
* */