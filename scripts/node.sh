#!/bin/sh -

PROJECTNAME=""
PORT=""

NODE_ENV="production"
APP_DIR="/root/hyperspace/projects/$PROJECTNAME"
CONFIG_DIR="$APP_DIR"
PID_DIR="$APP_DIR/pid"
PID_FILE="$PID_DIR/app.pid"
LOG_DIR="/var/log"
LOG_FILE="$LOG_DIR/$PROJECTNAME.log"
NODE_OPTIONS="PORT=$PORT"
NODE_EXEC="npm start"

USAGE="Usage: $0 {start|stop|restart|status} [--force]"
FORCE_OP=false

pid_file_exists() {
    [ -f "$PID_FILE" ]
}

get_pid() {
    echo "$(cat "$PID_FILE")"
}

is_running() {
    PID=$(get_pid)
    ! [ -z "$(ps aux | awk '{print $2}' | grep "^$PID$")" ]
}

start_it() {
    mkdir -p "$PID_DIR"
    mkdir -p "$LOG_DIR"

    echo "Starting node app ..."
    $NODE_OPTIONS $NODE_EXEC 1>"$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Node app started with pid $!"
}

stop_process() {
    PID=$(get_pid)
    echo "Killing process $PID"
    kill $PID
}

remove_pid_file() {
    echo "Removing pid file"
    rm -f "$PID_FILE"
}

start_app() {
    if pid_file_exists
    then
        if is_running
        then
            PID=$(get_pid)
            echo "Node app already running with pid $PID"
            exit 1
        else
            echo "Node app stopped, but pid file exists"
            if [ $FORCE_OP = true ]
            then
                echo "Forcing start anyways"
                remove_pid_file
                start_it
            fi
        fi
    else
        start_it
    fi
}

stop_app() {
    if pid_file_exists
    then
        if is_running
        then
            echo "Stopping node app ..."
            stop_process
            remove_pid_file
            echo "Node app stopped"
        else
            echo "Node app already stopped, but pid file exists"
            if [ $FORCE_OP = true ]
            then
                echo "Forcing stop anyways ..."
                remove_pid_file
                echo "Node app stopped"
            else
                exit 1
            fi
        fi
    else
        echo "Node app already stopped, pid file does not exist"
        exit 1
    fi
}

status_app() {
    if pid_file_exists
    then
        if is_running
        then
            PID=$(get_pid)
            echo "Node app running with pid $PID"
        else
            echo "Node app stopped, but pid file exists"
        fi
    else
        echo "Node app stopped"
    fi
}

case "$2" in
    --force)
        FORCE_OP=true
    ;;

    "")
    ;;

    *)
        echo $USAGE
        exit 1
    ;;
esac

case "$1" in
    start)
        start_app
    ;;

    stop)
        stop_app
    ;;

    restart)
        stop_app
        start_app
    ;;

    status)
        status_app
    ;;

    *)
        echo $USAGE
        exit 1
    ;;
esac