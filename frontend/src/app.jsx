import { useState } from "preact/hooks";
import Modal from "react-modal";
import "./app.css";
import { ToastContainer, toast } from "react-toastify";

const API_URL = "http://192.168.49.2:30001/api";
Modal.setAppElement("#app");

export function App() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState({ name: "", message: "" });
  const [responseTime, setResponseTime] = useState("");

  const submit = async () => {
    await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message: msg }),
    });
    toast.success("Submitted");
    setName("");
    setMsg("");
  };

  const checkStatus = () => {
    fetch(`${API_URL}/status`)
      .then((res) => res.json())
      .then((data) => toast.success(data?.status))
      .catch((err) => toast.error(err));
  };

  const openModalWith = (data) => {
    setModalData(data?.data);
    setResponseTime(data?.responseTime);
    setModalIsOpen(true);
  };

  const getFromDB = () => {
    fetch(`${API_URL}/db-contact`)
      .then((res) => res.json())
      .then((data) => openModalWith(data))
      .catch((err) => toast.error(err));
  };

  const getFromRedis = () => {
    fetch(`${API_URL}/redis-contact`)
      .then((res) => res.json())
      .then((data) => openModalWith(data))
      .catch((err) => toast.error(err));
  };

  return (
    <>
      <ToastContainer />
      <div className="container">
        <div>
          <div className="contact-heading">
            <h2>Contact Form</h2>
          </div>
          <div className="name-box">
            <input
              placeholder="Name"
              onInput={(e) => setName(e.target.value)}
              className="name-input"
              id="name"
              name="name"
            />
          </div>
          <div className="message-box">
            <textarea
              placeholder="Message"
              onInput={(e) => setMsg(e.target.value)}
              className="message-input"
              id="message"
              name="message"
            />
          </div>
          <div className="button-box">
            <button onClick={submit} className="submit-btn">
              SEND
            </button>
            <button onClick={checkStatus} className="submit-btn">
              STATUS
            </button>
            <button onClick={getFromDB} className="submit-btn">
              DB
            </button>
            <button onClick={getFromRedis} className="submit-btn">
              REDIS
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Contact Info"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "12px",
            padding: "20px",
            width: "300px",
          },
        }}
      >
        <h2>Contact Info</h2>
        <p>
          <strong>Name:</strong> {modalData.name}
        </p>
        <p>
          <strong>Message:</strong> {modalData.message}
        </p>
        <p>
          <strong>Response Time:</strong> {responseTime}s
        </p>
        <button
          onClick={() => setModalIsOpen(false)}
          style={{ marginTop: "1rem" }}
          className="submit-btn"
        >
          Close
        </button>
      </Modal>
    </>
  );
}
